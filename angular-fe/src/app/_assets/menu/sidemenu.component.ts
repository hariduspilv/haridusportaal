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
} from '@angular/core';
import { RippleService, SidemenuService, SettingsService, AuthService } from '@app/_services';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Location } from '@angular/common';
import { NavigationEnd, RouterEvent, Router } from '@angular/router';

@Component({
  selector: 'sidemenu-item',
  styleUrls: ['./sidemenu.styles.scss'],
  templateUrl: 'sidemenu.item.template.html',
})
export class SidemenuItemComponent {
  public isOpen: boolean = false;
  @Output() openStateChange = new EventEmitter;
  @Input() item: any = {};

  constructor(private ripple: RippleService, private cdr: ChangeDetectorRef) { }

  toggle(e) {
    this.isOpen = !this.isOpen;
    this.openStateChange.emit(this.item['label']);
    this.animateRipple(e);
  }

  public close() {
    this.isOpen = false;
    this.cdr.detectChanges();
  }

  public open() {
    this.isOpen = true;
    this.cdr.detectChanges();
  }
  animateRipple(event) {
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
  private subscription: Subscription = new Subscription();
  private authSub: Subscription = new Subscription();
  private routerSub: Subscription = new Subscription();
  @ViewChildren(SidemenuItemComponent) sidemenuItems: QueryList<SidemenuItemComponent>;
  @Input() data;
  @HostBinding('class') get hostClasses(): string {
    return this.isVisible ? 'sidemenu is-visible' : 'sidemenu';
  }

  constructor(
    private sidemenuService: SidemenuService,
    private http: HttpClient,
    private settings: SettingsService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private location: Location,
    private router: Router,
  ) {}

  subscribeToService():void {
    this.subscription = this.sidemenuService.isVisibleSubscription.subscribe((value) => {
      this.isVisible = value;
    });
  }

  subscribeToAuth():void {
    this.authSub = this.auth.isAuthenticated.subscribe((val) => {
      this.getData();
    });
  }

  subscribeToRouter(): void {
    this.routerSub = this.router.events.subscribe((event:RouterEvent) => {
      if (event instanceof NavigationEnd) {
        if (this.isVisible) {
          this.sidemenuService.close();
        }
        this.makeActive();
      }
    });
  }
  getData(init: boolean = false):void {
    const variables = {
      language: this.settings.activeLang,
    };
    const path = this.settings.query('getMenu', variables);
    // force to not use disk cache
    this.http.get(path, {
      headers: new HttpHeaders({ 'Cache-Control': 'no-cache' }),
    }).subscribe((response) => {
      this.data = response['data'];
      this.cdr.detectChanges();
      if (init) {
        this.makeActive();
      }
    });
  }

  makeActive() {
    const path = decodeURI(this.location.path());
    const categories = this.sidemenuItems.toArray().filter((el) => {
      if (el.item.links.length > 0) {
        return true;
      }
    });
    const activeCategory = categories.find((el) => {
      return el.item.links.find((link) => {
        if (link.url.path === path) {
          return true;
        }
        const pathRoot = path.split('/');
        if (link.url.path.includes(`${pathRoot[0]}/${pathRoot[1]}`)) {
          return true;
        }
        return false;
      });
    });
    if (activeCategory) {
      activeCategory.open();
    } else {
      this.closeOthers('');
    }
    this.cdr.detectChanges();
  }

  closeOthers(item: any = '') {
    this.sidemenuItems.toArray().map((el: any) => {
      if (el.item.label !== item) {
        el.close();
      }
    });
  }

  ngOnInit():void {
    this.subscribeToAuth();
    this.subscribeToService();
    this.subscribeToRouter();
    this.getData(true);
  }

  ngOnDestroy():void {
    this.subscription.unsubscribe();
    this.authSub.unsubscribe();
    this.routerSub.unsubscribe();
  }
}
