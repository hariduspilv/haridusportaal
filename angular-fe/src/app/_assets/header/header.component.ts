import {
	ChangeDetectorRef,
	Component,
	ElementRef,
	HostBinding,
	HostListener,
	Input, OnDestroy,
	OnInit,
	ViewChild
} from '@angular/core';
import {
	AlertsService,
	AnalyticsService,
	AuthService, LanguageCodes,
	ModalService,
	SettingsService,
	SidemenuService,
} from '@app/_services';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReplaySubject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { environment } from '@env/environment';
import { DeviceDetectorService } from 'ngx-device-detector';
import {
	findTranslation,
	getLangCode,
	isMainPage,
	isOnSearchPage,
	isWildcardPage,
	translatePath,
	translatePathTo
} from '@app/_core/router-utility';

@Component({
  selector: 'htm-header',
  templateUrl: './header.template.html',
  styleUrls: ['./header.styles.scss'],
})

export class HeaderComponent implements OnInit, OnDestroy {
  @Input() public loginStatus: boolean = false;
  @Input() public user: string = '';
  @HostBinding('attr.aria-label') public ariaLabel: string = this.translate.get('frontpage.header');
  @HostBinding('attr.role') public role: string = 'banner';
  @ViewChild('sidemenuToggle', { static: false, read: ElementRef }) public toggleBtn: ElementRef;
  private sidemenuInit = false;
  private focusBounce: any;
  public loginTooltip = this.settings?.data?.login_tooltip;
  public searchTerm: any;
  public logoutActive = false;
  public searchString = '';
  public theme: string = 'default';
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
	public availableLanguages: Record<string, string | LanguageCodes>[];
	public isOnSearchPage: boolean;
	private destroyed$ = new ReplaySubject(1);

	// when user clicks "back" or "forward" button, and it goes to the page in another language
	@HostListener('window:popstate') onBackOrForwardClick() {
		if (this.settings.currentAppLanguage !== getLangCode()) {

			// not good - force refresh
			window.location.href = window.location.pathname;

			// does NOT work correctly - not all data refreshed after back button push
			// this.settings.currentAppLanguage = getLangCode();
			// this.loading = true;
			//
			// this.translate.load().then(() => {
			// 	this.navigate(decodeURI(window.location.pathname));
			// });
		}
	}

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
    private deviceDetector: DeviceDetectorService,
  ) {	this.availableLanguages = settings.availableLanguages; }

  @HostBinding('class') get hostClasses(): string {
    return `header header--${this.theme}`;
  }

  public isNumber(e): boolean {
    const charCode = (e.which) ? e.which : e.keyCode;

    return !(charCode > 31 && (charCode < 48 || charCode > 57));
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
    ).subscribe({
      next: (data: any) => {
        this.loading = false;
        this.mobileId.challengeId = data.ChallengeID;
        const consecutiveForm = {
          session_code: data.Sesscode,
          id_code: data.UserIDCode,
          auth_method: 'mobile_id',
        };
        this.mobileIdRequest = this.auth.login(consecutiveForm)
          .subscribe({
            next: (response) => {
              this.modalService.close('login');
              this.mobileId.challengeId = '';
            },
            error: (err) => {
              this.alertsService
                .error(this.translate.get(err.error.message), 'login-modal', false, true);
              this.mobileId.challengeId = '';
            },
          });
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  public get active(): boolean {
    return this.sidemenuService.isVisible;
  }

  public toggleSidemenu(): void {
    this.sidemenuService.toggle();
  }

  public mobileIdCancel() {
    this.mobileId.challengeId = '';
    this.mobileIdRequest.unsubscribe();
  }

  public subscribeToAuth() {
    this.auth.isAuthenticated.subscribe((val) => {
      this.loginStatus = val;
    });
  }

	public subscribeToSidemenu(): void {
		this.sidemenuService.isVisibleSubscription.subscribe((visible) => {
			clearTimeout(this.focusBounce);
			if (!visible && this.sidemenuInit) {
				this.focusBounce = setTimeout(() => this.toggleBtn.nativeElement.focus(), 100);
			}
			// Ignore the initial state
			this.sidemenuInit = true;
		});

		this.sidemenuService.themeSubscription.subscribe({
			next: (theme) => this.theme = theme,
		});
	}

  public openLoginModal() {
    this.loginForm.reset();
    this.mobileIdForm.reset();
    this.getAuthMethods();
    this.modalService.toggle('login');
  }

  public getAuthMethods() {
    this.loading = true;
    if (environment.DEV_AUTH) {
      this.authMethods.basic = true;
      this.authMethods.mobile_id = true;
    }
    this.http.get(`${this.settings.url}/auth_methods?_format=json`).subscribe({
      next: (response: any) => {
        this.authMethods = Object.assign({}, this.authMethods, { ...response.auth_methods });
        this.availableAuthMethods =
          Object.entries(this.authMethods).filter(method => method[1]);
        if (!this.availableAuthMethods.length) {
          this.alertsService.info('login.unavailable', 'login', false);
        }
      },
      error: (response) => {
        this.alertsService.error(response.error.message, 'login', false);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  public searchClick() {
    this.searchRoute(this.searchTerm);
  }

  public searchRoute(e, timeout: boolean = false) {

    const term = !e ? this.searchTerm : (
      e instanceof Event ? e.target['0'].value : e
    );

    const url = `${translatePath('/otsing')}?term=${term}`;
    this.searchTerm = '';
    this.sendAnalyticsData(term);
    this.cdr.detectChanges();
    this.router.navigateByUrl(url);
  }

	// commented code does NOT work after some development
  public headerSearchEnabled(): void{
    // return this.activatedRoute.snapshot.firstChild &&
    //   this.activatedRoute.snapshot.firstChild.routeConfig.path !== 'otsing';

		const searchTranslation = findTranslation('otsing');
		this.router.events.pipe(takeUntil(this.destroyed$)).subscribe((event) => {
			if (event instanceof NavigationEnd) {
				const pathSplit = event.url.split('?')[0].split('/');
				this.isOnSearchPage = searchTranslation.includes(pathSplit[1]) || searchTranslation.includes(pathSplit[2]);
			}
		});
  }

  public sendAnalyticsData(term) {
    this.analytics.trackEvent('homeSearch', 'submit', term);
  }

  // wtf
  public openLogOutDropdown(event: Event) {
    if (!this.logoutActive) {
      document.addEventListener(
        'click',
        this.offClickHandler = () => this.offClickListener(),
      );
    }
  }

  public offClickListener() {
    if (this.logoutActive) {
      document.removeEventListener('click', this.offClickHandler);
      this.logoutActive = false;
    } else {
      this.logoutActive = true;
    }
  }

  public logOut() {
    document.removeEventListener('click', this.offClickHandler);
    this.logoutActive = false;
    this.auth.logout();
  }

  private setHamburgerStyles() {
    let outline: string;
    this.deviceDetector.isDesktop() ? outline = '1px solid black' : outline = 'none';

    const btnHamburger = document.querySelector('.header__hamburger')?.querySelector('button');
    btnHamburger?.style.setProperty('--border', outline);
  }

  public ngOnInit(): void {
    this.loginStatus = this.auth.isAuthenticated.getValue();
    this.subscribeToAuth();
    this.subscribeToSidemenu();
    this.getAuthMethods();
    this.setHamburgerStyles();
		this.headerSearchEnabled();
	}

	changeLanguage(code: LanguageCodes) {
		if (code !== getLangCode()) {
			this.settings.currentAppLanguage = code;
			this.loading = true;

			this.translate.load().then(() => {
				this.validatePath(code);
			});
		}
	}

	private validatePath(code: LanguageCodes): void {
		const newUrl = this.settings.currentLanguageSwitchLinks?.find((link) => link.language.id === code).url.path;
		const isWithoutTranslation = newUrl?.split('/')?.includes('node');

		if (isMainPage()) {
			this.navigate(code === LanguageCodes.ESTONIAN ? '' : code);
		} else if (isWithoutTranslation) {
			this.navigate(code === LanguageCodes.ESTONIAN ? '**' : `${code}/**`);
		} else if (isOnSearchPage()) {
			const pathSplit = this.router.url.split('?');
			const translatedPath = translatePathTo(pathSplit[0], code);
			this.navigate(translatedPath);
		} else if (newUrl) {
			this.navigate(newUrl);
		} else if (isWildcardPage()) {
			this.navigateToMainPage();
		} else {
			try {
				this.navigate(translatePathTo(this.router.url, code));
			} catch (error) {
				this.navigate(code === LanguageCodes.ESTONIAN ? '' : code);
			}
		}

		if (this.router.url === '/ametialad/andmed') {		// langSwitchLink en/node/123 - need to correct
			this.navigate('en/professions/data');
		}
		if (this.router.url === '/en/professions/data') {
			this.navigate('ametialad/andmed');
		}

		if (this.router.url === '/valdkonnad/andmed') {		// langSwitchLink en/node/123 - need to correct
			this.navigate('en/sectors/data');
		}
		if (this.router.url === '/en/sectors/data') {
			this.navigate('valdkonnad/andmed');
		}

		if (encodeURI(this.router.url) === '/sündmused/kalender') { // should be here, because calendar's render occurs in Angular
			this.navigate('en/events/calendar');
		}
		if (this.router.url === '/en/events/calendar') {
			this.navigate('sündmused/kalender');
		}
	}

	public navigateToMainPage(): void {
		const path = getLangCode() === LanguageCodes.ESTONIAN ? '/' : `/${getLangCode()}`;
		this.navigate(path);
	}

	private navigate(path: string) {
		this.router.navigate([path || '']).then(() => this.loading = false);
	}

	ngOnDestroy() {
		this.destroyed$.next(true);
		this.destroyed$.complete();
	}
}
