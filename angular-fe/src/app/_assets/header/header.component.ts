import { ChangeDetectorRef, Component, ElementRef, HostBinding, Input, OnInit, ViewChild } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@env/environment';
import { DeviceDetectorService } from "ngx-device-detector";
import {getLangCode, isLanguageCode, isMainPage, translatePath} from "@app/_core/router-utility";

@Component({
  selector: 'htm-header',
  templateUrl: './header.template.html',
  styleUrls: ['./header.styles.scss'],
})

export class HeaderComponent implements OnInit {
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

    this.sidemenuService.themeSubscription.subscribe((theme) => {
      this.theme = theme;
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

    const url = `/otsing?term=${term}`;
    this.searchTerm = '';
    this.sendAnalyticsData(term);
    this.cdr.detectChanges();
    this.router.navigateByUrl(url);
  }

  public headerSearchEnabled() {
    return this.activatedRoute.snapshot.firstChild &&
      this.activatedRoute.snapshot.firstChild.routeConfig.path !== 'otsing';
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
	}

	changeLanguage(code: LanguageCodes) {
		if (code !== getLangCode()) {
			this.settings.currentAppLanguage = code;
			this.loading = true;
			this.translate.load().then(() => {
				this.loading = false;
				this.validatePath(code);
			});
		}
	}

	private validatePath(code: LanguageCodes): void {
		const paths = this.router.url.split('/').splice(1);
		const pathsLength = paths.length;

		const isMainPage = pathsLength === 1 && (paths[0] === '' || isLanguageCode(paths[0]));
		if (isMainPage) {
			code === 'et' ? this.navigate('') : this.navigate(code);
		}

		const newUrl = this.settings.currentLanguageSwitchLinks?.find((link) => link.language.id === code).url.path;
		if (newUrl) {
			console.log('newUrl: ', newUrl)
			this.navigate(newUrl);
		}

		if (this.router.url === '/karj%C3%A4%C3%A4r') {
			this.navigate('en/career');
		}
		if (this.router.url === '/en/career') {
			this.navigate('karjäär');
		}
		if (this.router.url === '/%C3%B5ppimine') {
			this.navigate('en/learning');
		}
		if (this.router.url === '/en/learning') {
			this.navigate('õppimine');
		}
		if (this.router.url === '/kool') {
			this.navigate('en/school');
		}
		if (this.router.url === '/en/school') {
			this.navigate('kool');
		}
		if (this.router.url === '/kool/kaart') {
			this.navigate('en/school/map');
		}
		if (this.router.url === '/en/school/map') {
			this.navigate('kool/kaart');
		}
		if (this.router.url === '/koolide-rahastus') {
			this.navigate('en/money-to-school');
		}
		if (this.router.url === '/en/money-to-school') {
			this.navigate('koolide-rahastus');
		}
		if (this.router.url === '/koolide-rahastus/haldus%C3%BCksused') {
			this.navigate('en/money-to-school/administrative-units');
		}
		if (this.router.url === '/en/money-to-school/administrative-units') {
			this.navigate('koolide-rahastus/haldusüksused');
		}
		if (this.router.url === '/erialad') {
			this.navigate('en/study-programmes');
		}
		if (this.router.url === '/en/study-programmes') {
			this.navigate('erialad');
		}
		if (this.router.url === '/ametialad') {
			this.navigate('en/professions');
		}
		if (this.router.url === '/en/professions') {
			this.navigate('ametialad');
		}
		if (this.router.url === '/ametialad/andmed') {
			this.navigate('en/professions/data');
		}
		if (this.router.url === '/en/professions/data') {
			this.navigate('ametialad/andmed');
		}
		if (this.router.url === '/kool/4t') {	// :id
			this.navigate('en/school/4t');
		}
		if (this.router.url === '/en/school/4t') {
			this.navigate('kool/4t');
		}
		if (this.router.url === '/valdkonnad') {
			this.navigate('en/sectors');
		}
		if (this.router.url === '/en/sectors') {
			this.navigate('valdkonnad');
		}
		if (this.router.url === '/valdkonnad/andmed') {
			this.navigate('en/sectors/data');
		}
		if (this.router.url === '/en/sectors/data') {
			this.navigate('valdkonnad/andmed');
		}
		if (this.router.url === '/valdkonnad/kaart') {
			this.navigate('en/sectors/map');
		}
		if (this.router.url === '/en/sectors/map') {
			this.navigate('valdkonnad/kaart');
		}
		if (this.router.url === '/tööjõuprognoos/töö-ja-oskused-2025') {
			this.navigate('en/survey-pages/work-and-skills-2025');
		}
		if (this.router.url === '/en/survey-pages/work-and-skills-2025') {
			this.navigate('tööjõuprognoos/töö-ja-oskused-2025');
		}
		if (this.router.url === '/oska-tulemused/ettepanekute-elluviimine') {
			this.navigate('en/oska-results/proposals-implementation');
		}
		if (this.router.url === '/en/oska-results/proposals-implementation') {
			this.navigate('oska-tulemused/ettepanekute-elluviimine');
		}
		if (this.router.url === '/uuringud') {
			this.navigate('en/studies');
		}
		if (this.router.url === '/en/studies') {
			this.navigate('uuringud');
		}
		if (this.router.url === '/noored') {
			this.navigate('en/youth');
		}
		if (this.router.url === '/en/youth') {
			this.navigate('noored');
		}
		if (this.router.url === '/%C3%B5petaja') {
			this.navigate('en/teacher');
		}
		if (this.router.url === '/en/teacher') {
			this.navigate('õpetaja');
		}
		if (this.router.url === '/infos%C3%BCsteemid/eesti-hariduse-infos%C3%BCsteem-ehis') {
			this.navigate('en/infosystems/estonian-education-information-system-ehis');
		}
		if (this.router.url === '/en/infosystems/estonian-education-information-system-ehis') {
			this.navigate('infosüsteemid/eesti-hariduse-infosüsteem-ehis');
		}
		if (this.router.url === '/infos%C3%BCsteemid/eesti-hariduse-infos%C3%BCsteem-ehis') {
			this.navigate('en/infosystems/estonian-education-information-system-EHIS-TEST2-longer-name-or-100-chars-or-100-chars-or-100-char');
		}
		if (this.router.url === '/en/infosystems/estonian-education-information-system-EHIS-TEST2-longer-name-or-100-chars-or-100-chars-or-100-char') {
			this.navigate('infosüsteemid/eesti-hariduse-infosüsteem-ehis');
		}
		if (this.router.url === '/uudised') {
			this.navigate('en/news');
		}
		if (this.router.url === '/en/news') {
			this.navigate('uudised');
		}
		if (this.router.url === '/s%C3%BCndmused') {
			this.navigate('en/events');
		}
		if (this.router.url === '/en/events') {
			this.navigate('sündmused');
		}
		if (this.router.url === '/s%C3%BCndmused/kalender') {
			this.navigate('en/events/calendar');
		}
		if (this.router.url === '/en/events/calendar') {
			this.navigate('sündmused/kalender');
		}
		if (this.router.url === '/tunnistuse-kehtivuse-kontroll') {
			this.navigate('en/certificate-validity-check');
		}
		if (this.router.url === '/en/certificate-validity-check') {
			this.navigate('tunnistuse-kehtivuse-kontroll');
		}
		if (decodeURI(this.router.url) === '/tunnistused/lõpudokumendid') {
			this.navigate('en/certificates/finishing-docs');
		}
		if (this.router.url === '/en/certificates/finishing-docs') {
			this.navigate('tunnistused/lõpudokumendid');
		}


		if (decodeURI(this.router.url) === '/töölaud/tunnistused') {
			this.navigate('en/dashboard/certificates');
		}
		if (this.router.url === '/en/dashboard/certificates') {
			this.navigate('töölaud/tunnistused');
		}
	}

	public navigateToMainPage(): void {
		const path = getLangCode() === 'et' ? '/' : `/${getLangCode()}`;
		this.navigate(path);
	}

	private navigate(path: string) {
		this.router.navigate([path || '']).then(() => this.loading = false);
	}
}
