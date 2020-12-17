import {
  Component,
  Input,
  HostBinding,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChildren,
  QueryList,
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
  public version: any = environment.VERSION;
  private subscription: Subscription = new Subscription();
  private authSub: Subscription = new Subscription();
  private routerSub: Subscription = new Subscription();

  @ViewChildren(MenuItemComponent) private menus: QueryList<MenuItemComponent>;

  @Input() public data: IMenuData[];

  @HostBinding('class') get hostClasses(): string {
    return this.isVisible ? 'sidemenu is-visible' : 'sidemenu';
  }

  constructor(
    private sidemenuService: SidemenuService,
    private http: HttpClient,
    private settings: SettingsService,
    private auth: AuthService,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef) {}

  public closeSidemenu(): void {
    this.sidemenuService.close();
  }

  private subscribeToRouter(): void {
    this.routerSub = this.router.events.subscribe((event:RouterEvent) => {
      if (event instanceof NavigationEnd) {
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
    });
  }

  private getData(init: boolean = false): void {
    const variables = {
      language: this.settings.activeLang,
    };
    const path = this.settings.query('getMenu', variables);
    // force to not use disk cache
    this.http.get(path, {
      headers: new HttpHeaders({ 'Cache-Control': 'no-cache' }),
    }).subscribe((response: IMenuResponse) => {
      this.data = response.data.menu.links;
      // Set all the first level menus as such
      this.data.forEach((item: IMenuData) => item.firstLevel = true);
      this.cdr.detectChanges();
      if (init) {
        this.makeActive();
      }
    });
  }

  /**
   * This function is used to extend menus and sub menus according to their URL every time
   * the route changes or page reloads.
   * @param items List of menu items, starts from the items from menus in `menus`
   * @param path Browser URL
   * @param depth Current menu depth, starts at 0
   */
  private hasActiveInTree(items: IMenuData[], path: string, depth: number): boolean {
    let hasExpanded = false;
    for (const item of items) {
      const pathSplit = path.split('/');
      const match = (pathSplit.length > 2 && item.url.path === `${pathSplit[0]}/${pathSplit[1]}`) ||
        path.replace(/\?.*/, '') === item.url.path;

      if (item.links && item.links.length) {
        const has = this.hasActiveInTree(item.links, path, depth + 1);
        if (depth === 1) {
          item.expanded = !item.userClosed;
          item.active = has;
          if (!hasExpanded && (match || has)) {
            hasExpanded = true;
          }
        } else {
          if (match || has) {
            item.expanded = true;
            item.active = true;
            hasExpanded = true;
          } else {
            item.expanded = false;
            item.active = false;
          }
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
   * This function simply calls `hasActiveInTree` on all the first level menus.
   */
  private makeActive(): void {
    const path = decodeURI(this.location.path());

    for (const menu of this.menus) {
      this.hasActiveInTree(menu.items, path, 0);
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
    this.getData(true);
  }

  public ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    this.authSub.unsubscribe();
    this.subscription.unsubscribe();
  }
}
