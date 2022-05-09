import {
	Component,
	Input,
	HostBinding,
	OnInit,
	OnDestroy,
	ChangeDetectorRef,
	ViewChildren,
	QueryList,
	ViewChild,
	ElementRef,
	HostListener,
} from '@angular/core';
import { SidemenuService, SettingsService, AuthService } from '@app/_services';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Location } from '@angular/common';
import { NavigationEnd, RouterEvent, Router } from '@angular/router';
import { environment } from '@env/environment';
import { IMenuData, IMenuResponse } from './sidemenu.model';
import { MenuItemComponent } from './sidemenu-item.component';

@Component({
  selector: 'sidemenu',
  templateUrl: './sidemenu.template.html',
  styleUrls: ['./sidemenu.styles.scss'],
})
export class MenuComponent implements OnInit, OnDestroy {
  public isVisible: boolean;
  public wasClosed: boolean = false;
  public readerVisible = false;
  public version: any = environment.VERSION;
	public isLoading = true;

  private subscription: Subscription = new Subscription();
  private authSub: Subscription = new Subscription();
  private routerSub: Subscription = new Subscription();
  private languageSub: Subscription = new Subscription();
  private initialSub = false;
  private initialAutoOpen = false;
  private focusBounce: any;
  private visibilityBounce: any;
	private languageWasChanged = false;

  @ViewChildren(MenuItemComponent) private menus: QueryList<MenuItemComponent>;
  @ViewChild('sidemenuCloser', { static: false, read: ElementRef }) private closeBtn: ElementRef;

  @Input() public data: IMenuData[];

  @HostBinding('class') get hostClasses(): string {
    return this.isVisible ? 'sidemenu is-visible' : 'sidemenu';
  }

  @HostBinding('style.visibility') get readerVisbility(): string {
    return this.readerVisible ? 'visible' : 'hidden';
  }

  constructor(
    private sidemenuService: SidemenuService,
    private http: HttpClient,
    private settings: SettingsService,
    private auth: AuthService,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef) {}

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if ((event.key === 'Escape' || event.keyCode === 27) && this.isVisible) {
      this.closeSidemenu();
    }
  }

  public closeSidemenu(): void {
    this.sidemenuService.close();
  }

	private subscribeToLanguage(): void {
		this.languageSub = this.settings.activeLang$.subscribe({
			next:() => {
				this.languageWasChanged = true;
				this.getData(true);
			},
			complete: () => this.languageWasChanged = false,
		});
	}

  private subscribeToRouter(): void {
    this.routerSub = this.router.events.subscribe((event:RouterEvent) => {
      if (event instanceof NavigationEnd) {
        if (!event.url.endsWith('#content') && this.initialSub) {
          this.sidemenuService.resetPageFocus();
        }
        this.makeActive();
      }
    });
  }

  private subscribeToAuth(): void {
    this.authSub = this.auth.isAuthenticated.subscribe((val) => {
      this.getData(true);
    });
  }

  private subscribeToService(): void {
    this.subscription = this.sidemenuService.isVisibleSubscription.subscribe((value) => {
      this.isVisible = value;
      clearTimeout(this.visibilityBounce);
      if (!value && this.initialSub) {
        this.wasClosed = true;
      }
      if (value) {
        this.readerVisible = true;
        clearTimeout(this.focusBounce);
        if (this.initialSub && !this.initialAutoOpen) {
          this.focusBounce = setTimeout(() => this.closeBtn.nativeElement.focus(), 100);
        }
      } else {
        this.visibilityBounce = setTimeout(() => this.readerVisible = false, 200);
      }
      // Ignore the initial state
      this.initialSub = true;
      if (this.initialAutoOpen) {
        this.initialAutoOpen = false;
      }
    });
  }

  private getData(init: boolean = false): void {
		this.isLoading = true;
    const variables = {
      language: this.settings.currentAppLanguage.toUpperCase(),
    };
    const path = this.settings.query('getMenu', variables);
    // force to not use disk cache
    this.http.get(path, {
      headers: new HttpHeaders({ 'Cache-Control': 'no-cache' }),
    }).subscribe({
			next: (response: IMenuResponse) => {
				this.data = response.data.menu.links;
				// Set all the first level menus as such
				this.data.forEach((item: IMenuData) => item.firstLevel = true);
				this.cdr.detectChanges();
				if (init) {
					this.makeActive();
				}
			},
			error: () => { this.isLoading = false; },
			complete: () => { this.isLoading = false; },
		});
  }

  /**
   * This function is used to extend menus and sub menus according to their URL every time
   * the route changes or page reloads.
   * @param items List of menu items, starts from the items from menus in `menus`
   * @param path Browser URL
   */
  private hasActiveInTree(items: IMenuData[], path: string): boolean {
    let hasExpanded = false;
    for (const item of items) {
      const pathSplit = path.split('/');
      const match = (pathSplit.length > 2 && item.url.path === `${pathSplit[0]}/${pathSplit[1]}`) ||
        path.replace(/\?.*/, '') === item.url.path;

      if (item.links && item.links.length) {
        const has = this.hasActiveInTree(item.links, path);

        if (match || has) {
          item.expanded = true;
          item.active = true;
          hasExpanded = true;
        } else {
          item.expanded = false;
          item.active = false;
        }
      } else if (match) {
        item.active = true;
        hasExpanded = true;
      } else {
        item.active = false;
      }
    }

    return hasExpanded;
  }

  /**
   * This function simply calls `hasActiveInTree` on all the first level menus and opens
   * the menu automatically when the page is a content page
   * and was opened directly (on initialization).
   */
  private makeActive(): void {
    const path = decodeURI(this.location.path());
		let opened = false;

		for (const menu of this.menus) {
      if (this.hasActiveInTree(menu.items, path)) {
        opened = true;
      }
    }

    if (opened || this.languageWasChanged) {
      // Determine the theme of the current page
			for (const menu of this.menus) {
        for (const item of menu.items) {
          if (item.firstLevel && item.active) {
            const themestr = item.label.toLowerCase();
						const resolved = this.sidemenuService.themes[themestr] || 'default';
            this.sidemenuService.setTheme(resolved);
          }
        }
      }

      // Open the menu when: 1. not in mobile view 2. the menu
      // is not already visible and 3. the page is not in the list of pages not to open on
      if (!this.sidemenuService.isMobileView && !this.isVisible && !this.wasClosed &&
        this.sidemenuService.ignoreAutoOpen.indexOf(path) === -1) {
        this.initialAutoOpen = true;
        this.sidemenuService.toggle();
      }
    } else {
      this.sidemenuService.setTheme('default');
    }

    this.cdr.detectChanges();
  }

  /**
   * Closes all other first-level menus except the one that was opened.
   * @param $event `IMenuData` that was opened
   */
  public hideOthers($event: IMenuData): void {
    for (const menu of this.menus) {
      menu.items.forEach((i: IMenuData) => {
        if (i !== $event && i.expanded) {
          i.expanded = false;
        }
      });
    }
  }

  public ngOnInit(): void {
    this.subscribeToAuth();
    this.subscribeToService();
    this.subscribeToRouter();
		this.subscribeToLanguage();
    this.getData(true);
  }

	public ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    this.authSub.unsubscribe();
    this.subscription.unsubscribe();
		this.languageSub.unsubscribe();
  }
}
