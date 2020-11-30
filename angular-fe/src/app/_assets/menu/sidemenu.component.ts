import {
  Component,
  Input,
  HostBinding,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  OnChanges,
  ViewChildren,
  QueryList,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';
import { RippleService, SidemenuService, SettingsService, AuthService } from '@app/_services';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Location } from '@angular/common';
import { NavigationEnd, RouterEvent, Router } from '@angular/router';
import { environment } from '@env/environment';
import { mergeAnalyzedFiles } from '@angular/compiler';

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
  @Output() public toggle: EventEmitter<IMenuData> = new EventEmitter<IMenuData>();

  constructor(private router: Router, private location: Location) {}

  clickMenuItem(item: IMenuData, event: any) {
    event.stopPropagation();
    const path = decodeURI(this.location.path());
    const match = item.url.path === path.split('?')[0].split('#')[0] ||
                  path.includes(item.url.path);

    if (!match && item.url.path !== '#nolink') {
      this.router.navigateByUrl(item.url.path);
    } else {
      if (item.links.length) {
        item.expanded = !item.expanded;
        if (!item.expanded) {
          item.userClosed = true;
        } else if (item.userClosed) {
          item.userClosed = false;
        }
        this.toggle.emit(item);
      }
    }
  }
}

@Component({
  selector: 'sidemenu',
  templateUrl: './sidemenu.template.html',
  styleUrls: ['./sidemenu.styles.scss'],
})
export class MenuComponent implements OnInit, OnDestroy {
  public isVisible: boolean;
  private subscription: Subscription = new Subscription();
  private routerSub: Subscription = new Subscription();
  @ViewChildren(MenuItemComponent) private menus: QueryList<MenuItemComponent>;
  public data = {
    menu: {
      links: [
        {
          description: null,
          label: 'Õppimine',
          links: [
            {
              description: null,
              label: 'Õppeasutused',
              links: [],
              url: {
                path: '/kool',
                internal: true,
              },
            },
            {
              description: null,
              label: 'Õppekavad',
              links: [],
              url: {
                path: '/erialad',
                internal: true,
              },
            },
            {
              description: null,
              label: 'Õpitee',
              links: [
                {
                  description: null,
                  label: 'Algharidus',
                  links: [],
                  url: {
                    path: '/artiklid/artikkel-mugudest',
                    internal: true,
                  },
                },
                {
                  description: null,
                  label: 'Põhiharidus',
                  links: [],
                  url: {
                    path: '/artiklid/asdf',
                    internal: true,
                  },
                },
              ],
              url: {
                path: '#nolink',
                internal: true,
              },
            },
          ],
          url: {
            internal: true,
            path: '/õppimine',
          },
        },
        {
          description: null,
          label: 'Karjäär',
          links: [
            {
              description: null,
              label: 'Valdkonnad tööturul',
              links: [],
              url: {
                path: '/artiklid/linkide-ja-failide-näide',
                internal: true,
              },
            },
            {
              description: null,
              label: 'Tööta ja õpi',
              links: [
                {
                  description: null,
                  label: 'Koolitused',
                  links: [],
                  url: {
                    path: '/ametialad/oska-põhikutseala-test-05102018',
                    internal: true,
                  },
                },
                {
                  description: null,
                  label: 'õõõõ',
                  links: [],
                  url: {
                    path: '/tööjõuprognoos/tööjõuprognoos-pilt-ja-videod-test',
                    internal: true,
                  },
                },
              ],
              url: {
                path: '#nolink',
                internal: true,
              },
            },
          ],
          url: {
            internal: true,
            path: '/karjäär',
          },
        },
        {
          description: null,
          label: 'Infosüsteemid',
          links: [],
          url: {
            path: '/artiklid/afefewf',
            internal: true,
          },
        },
      ],
    },
  };

  @HostBinding('class') get hostClasses(): string {
    return this.isVisible ? 'sidemenu is-visible' : 'sidemenu';
  }

  constructor(
    private sidemenuService: SidemenuService,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef) {}

  subscribeToRouter(): void {
    this.routerSub = this.router.events.subscribe((event:RouterEvent) => {
      if (event instanceof NavigationEnd) {
        /*if (this.isVisible) {
          this.sidemenuService.close();
        }*/
        this.makeActive();
      }
    });
  }

  subscribeToService(): void {
    this.subscription = this.sidemenuService.isVisibleSubscription.subscribe((value) => {
      this.isVisible = value;
    });
  }

  hasActiveInTree(items: IMenuData[], path: string, depth: number): boolean {
    let hasExpanded = false;
    for (const item of items) {
      const match =
        item.url.path === path.split('?')[0].split('#')[0] ||
        path.includes(item.url.path);

      if (item.links.length) {
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

  makeActive(): void {
    const path = decodeURI(this.location.path());

    this.cdr.detectChanges();
    for (const menu of this.menus) {
      this.hasActiveInTree(menu.items, path, 0);
    }
  }

  ngOnInit(): void {
    this.subscribeToService();
    this.subscribeToRouter();
  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    this.subscription.unsubscribe();
  }
}
