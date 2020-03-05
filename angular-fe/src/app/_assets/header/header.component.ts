import { ChangeDetectorRef, Component, HostBinding, Input, OnInit } from '@angular/core';
import {
  AlertsService,
  AnalyticsService,
  AuthService,
  ModalService,
  SettingsService,
  SidemenuService,
} from '@app/_services';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'htm-header',
  templateUrl: './header.template.html',
  styleUrls: ['./header.styles.scss'],
})

export class HeaderComponent implements OnInit {
  public active: boolean;
  @Input() loginStatus: boolean = false;
  @Input() user: string = '';
  @HostBinding('attr.aria-label') ariaLabel: string = this.translate.get('frontpage.header');
  @HostBinding('attr.role') role: string = 'banner';
  public searchTerm: any;
  public logoutActive = false;
  public searchString = '';
  public loading = false;
  public mobileId = {
    challengeId: '',
  };
  public authMethods = {
    harid: false,
    tara: false,
    mobile_id: false,
    basic: false,
  };
  public availableAuthMethods = [];
  public mobileIdRequest: Subscription = new Subscription();
  public offClickHandler: any;
  public loginForm: FormGroup = this.formBuilder.group({
    password: ['', Validators.required],
    username: ['', Validators.required],
  });
  public mobileIdForm: FormGroup = this.formBuilder.group({
    phoneNumber: ['', Validators.required],
  });

  constructor(
    public sidemenuService: SidemenuService,
    public modalService: ModalService,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    public auth: AuthService,
    private settings: SettingsService,
    private http: HttpClient,
    private alertsService: AlertsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private analytics: AnalyticsService,
  ) {
  }

  @HostBinding('class') get hostClasses(): string {
    return 'header';
  }

  public basicLogin(): void {
    this.alertsService.clear('login-modal');
    const data = { ...this.loginForm.value, auth_method: 'basic' };
    const subscription = this.auth.login(data).subscribe((response) => {
      this.modalService.close('login');
      subscription.unsubscribe();
    });
  }

  public taraLogin(): void {
    window.location.href = `${this.settings.url}/external-login/tara`;
  }

  public harIdLogin(): void {
    window.location.href = `${this.settings.url}/external-login/harid`;
  }

  // needs to be finished
  public mobileIdLogin(): void {
    this.alertsService.clear('login-modal');
    this.loading = true;
    this.http.post(
      `${this.settings.url}${this.settings.mobileLogin}`,
      { telno: this.mobileIdForm.controls.phoneNumber.value },
    ).subscribe(
      (data: any) => {
        this.loading = false;
        this.mobileId.challengeId = data.ChallengeID;
        const consecutiveForm = {
          session_code: data.Sesscode,
          id_code: data.UserIDCode,
          auth_method: 'mobile_id',
        };
        this.mobileIdRequest = this.auth.login(consecutiveForm)
          .subscribe(
            (response) => {
              this.modalService.close('login');
              this.mobileId.challengeId = '';
            },
            (err) => {
              this.alertsService
                .error(this.translate.get(err.error.message), 'login-modal', false, true);
              this.mobileId.challengeId = '';
            },
            () => {
            });
      },
      (err: any) => {
      },
      () => {
        this.loading = false;
      },
    );
  }

  toggleSidemenu(): void {
    this.sidemenuService.toggle();
    this.active = this.sidemenuService.isVisible;
  }

  mobileIdCancel() {
    this.mobileId.challengeId = '';
    this.mobileIdRequest.unsubscribe();
  }

  subscribeToAuth() {
    this.auth.isAuthenticated.subscribe((val) => {
      this.loginStatus = val;
    });
  }

  public openLoginModal() {
    this.loginForm.reset();
    this.mobileIdForm.reset();
    this.getAuthMethods();
    this.modalService.toggle('login');
  }

  getAuthMethods() {
    this.loading = true;
    if (
      this.settings.url === 'https://htm.wiseman.ee' ||
      this.settings.url === 'http://test-htm.wiseman.ee:30000' ||
      this.settings.url === 'https://apitest.hp.edu.ee'
    ) {
      this.authMethods.basic = true;
      this.authMethods.mobile_id = true;
    }
    this.http.get(`${this.settings.url}/auth_methods?_format=json`).subscribe(
      (response) => {
        this.authMethods = Object.assign({}, this.authMethods, { ...response['auth_methods'] });
        this.availableAuthMethods =
          Object.entries(this.authMethods).filter(method => method[1]);
        if (!this.availableAuthMethods.length) {
          this.alertsService.info('login.unavailable', 'login', false);
        }
      },
      (response) => {
        this.alertsService.error(response.error.message, 'login', false);
        this.loading = false;
      },
      () => {
        this.loading = false;
      });
  }

  searchRoute(e, timeout: boolean = false) {

    const term = !e ? this.searchTerm : (
      e instanceof Event ? e.target['0'].value : e
    );

    const url = `/otsing?term=${term}`;
    this.searchTerm = '';
    this.sendAnalyticsData(term);
    this.cdr.detectChanges();
    this.router.navigateByUrl(url);
  }

  headerSearchEnabled() {
    return this.activatedRoute.snapshot.firstChild &&
      this.activatedRoute.snapshot.firstChild.routeConfig.path !== 'otsing';
  }

  sendAnalyticsData(term) {
    this.analytics.trackEvent('homeSearch', 'submit', term);
  }

  // wtf
  openLogOutDropdown(event: Event) {
    if (!this.logoutActive) {
      document.addEventListener(
        'click',
        this.offClickHandler = () => this.offClickListener(),
      );
    }
  }

  offClickListener() {
    if (this.logoutActive) {
      document.removeEventListener('click', this.offClickHandler);
      this.logoutActive = false;
    } else {
      this.logoutActive = true;
    }
  }

  logOut() {
    document.removeEventListener('click', this.offClickHandler);
    this.logoutActive = false;
    this.auth.logout();
  }

  ngOnInit(): void {
    this.active = this.sidemenuService.isVisible;
    this.loginStatus = this.auth.isAuthenticated.getValue();
    this.subscribeToAuth();
    this.getAuthMethods();
  }
}
