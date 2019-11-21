import {
  Component,
  Input,
  HostBinding,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  OnChanges,
} from '@angular/core';
import { RippleService, SidemenuService, SettingsService, AuthService } from '@app/_services';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'sidemenu-item',
  styleUrls: ['./sidemenu.styles.scss'],
  templateUrl: 'sidemenu.item.template.html',
})
export class SidemenuItemComponent {
  public isOpen: boolean = false;
  @Input() item: object = {};

  constructor(private ripple: RippleService) { }

  toggle(e) {
    this.isOpen = !this.isOpen;
    this.animateRipple(e);
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
  ) {}

  subscribeToService():void {
    this.subscription = this.sidemenuService.isVisibleSubscription.subscribe((value) => {
      this.isVisible = value;
    });
  }

  subscribeToAuth():void {
    this.auth.isAuthenticated.subscribe((val) => {
      this.getData();
    });
  }
  getData():void {
    const variables = {
      language: this.settings.activeLang,
    };
    const path = this.settings.query('getMenu', variables);
    this.http.get(path).subscribe((response) => {
      this.data = response['data'];
      this.cdr.detectChanges();
    });
  }

  ngOnInit():void {
    this.subscribeToAuth();
    this.subscribeToService();
    this.getData();
  }

  ngOnDestroy():void {
    this.subscription.unsubscribe();
  }
  // needs to have a service associated to it
  // needs to get menu data on init
}
