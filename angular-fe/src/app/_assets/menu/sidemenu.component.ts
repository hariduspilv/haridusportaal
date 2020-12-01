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
import { RippleService, SidemenuService, SettingsService, AuthService } from '@app/_services';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Location } from '@angular/common';
import { NavigationEnd, RouterEvent, Router } from '@angular/router';
import { environment } from '@env/environment';

interface IMenuURL {
  path: string;
  internal: boolean;
}

interface IMenuData {
  label: string;
  description?: string;
  links: IMenuData[];
  url: IMenuURL;
  expanded?: boolean;
  active?: boolean;
  userClosed?: boolean;
}

@Component({
  selector: 'sidemenu-item',
  templateUrl: './sidemenu.item.template.html',
  styleUrls: ['./sidemenu.styles.scss'],
})
export class MenuItemComponent {
  @Input() public items: IMenuData[];
  @Input() public type = 'item';

  constructor(
    private ripple: RippleService,
    private router: Router,
    private location: Location) {}

  // Navigate or expand/hide
  public clickMenuItem(item: IMenuData, event: any) {
    const path = decodeURI(this.location.path());
    const match = path.replace(/\?.*/, '') === item.url.path;

    if (!match &&
        item.url.path !== '#nolink' &&
        item.url.path !== '#nocategory' &&
        item.url.path !== '#category') {
      this.router.navigateByUrl(item.url.path);
    } else {
      if (item.links.length) {
        item.expanded = !item.expanded;
        if (!item.expanded) {
          item.userClosed = true;
        } else if (item.userClosed) {
          item.userClosed = false;
        }
      }
    }
  }

  public animateRipple(event: any) {
    this.ripple.animate(event, 'dark');
  }
}

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

  private subscribeToAuth():void {
    this.authSub = this.auth.isAuthenticated.subscribe((val) => {
      this.getData();
    });
  }

  private subscribeToService(): void {
    this.subscription = this.sidemenuService.isVisibleSubscription.subscribe((value) => {
      this.isVisible = value;
    });
  }

  private getData(init: boolean = false):void {
    const variables = {
      language: this.settings.activeLang,
    };
    const path = this.settings.query('getMenu', variables);
    // force to not use disk cache
    this.http.get(path, {
      headers: new HttpHeaders({ 'Cache-Control': 'no-cache' }),
    }).subscribe((response) => {
      if (response['data'] &&
          response['data']['menu'] &&
          response['data']['menu']['links']) {
        this.data = response['data']['menu']['links'];
      }
      this.cdr.detectChanges();
      if (init) {
        this.makeActive();
      }
    });
  }

  private hasActiveInTree(items: IMenuData[], path: string, depth: number): boolean {
    let hasExpanded = false;
    for (const item of items) {
      const s = path.split('/');
      const match = (s.length > 2 && item.url.path === `${s[0]}/${s[1]}`) ||
        path.replace(/\?.*/, '') === item.url.path;

      if (item.links && item.links.length) {
        const has = this.hasActiveInTree(item.links, path, depth + 1);
        if (depth === 1) {
          item.expanded = !item.userClosed;
          item.active = has;
          if (!hasExpanded && (match || has)) {
            hasExpanded = match || has;
          }
        } else {
          if ((match || has) && !item.userClosed) {
            item.expanded = true;
            item.active = match || has;
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

  private makeActive(): void {
    const path = decodeURI(this.location.path());

    for (const menu of this.menus) {
      this.hasActiveInTree(menu.items, path, 0);
    }

    this.cdr.detectChanges();
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
