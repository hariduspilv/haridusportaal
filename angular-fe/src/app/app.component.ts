import {AfterViewInit, Component, OnInit} from '@angular/core';
import {
  Alert,
  AlertsService,
  AlertType,
  AnalyticsService,
  AuthService,
  ModalService,
  SettingsService,
  SidemenuService,
} from './_services';
import {NavigationEnd, Router} from '@angular/router';
import {Location} from '@angular/common';
import {AmpService} from './_services/ampService';
import {TranslateService} from './_modules/translate/translate.service';
import {CookieService} from './_services/CookieService';
import {DeviceDetectorService} from 'ngx-device-detector';
import {environment} from '@env/environment';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit, AfterViewInit {
	public sidemenuIsVisible: boolean = false;
	translationsLoaded$: Observable<boolean> = this.translate.translationsLoaded$;
	loaderMessage = 'Ei saa serveriga ühendust, proovi mõne minuti pärast uuesti!';

	constructor(
		public sidemenuService: SidemenuService,
		public auth: AuthService,
		private router: Router,
		private location: Location,
		private amp: AmpService,
		private alertsService: AlertsService,
		private settingsService: SettingsService,
		private translate: TranslateService,
		private cookieService: CookieService,
		public modalService: ModalService,
		private analytics: AnalyticsService,
		private device: DeviceDetectorService,
	) {
		this.sidemenuIsVisible = sidemenuService.isVisible;
		if (this.device.isDesktop()) {
			document.querySelector('html').className = 'device-desktop';
		} else {
			document.querySelector('html').className = 'device-mobile';
		}
	}

	public onActivate(): void {
		try {
			document.querySelector('.app-content').scrollTo({
				top: 0,
			});
		} catch (err) {
		}
	}

	closeSidemenu(event: Event) {
		if (this.sidemenuIsVisible && this.sidemenuService.isMobileView) {
			this.sidemenuService.toggle();
		}
		return;
	}

	cookieAlert() {
		this.alertsService.notify(new Alert({
			category: 'cookie',
			link: {
				url: this.settingsService.data.cookie_link,
				label: this.translate.get('read_terms'),
			},
			message: this.translate.get('cookie_text'),
			id: 'cookie',
			type: AlertType.Cookie,
			closeable: true,
		}));
	}

	initCookies() {
		const cookiesAuth = this.cookieService.isAuthorized();

		if (cookiesAuth !== 'not_allowed') {
			if (cookiesAuth) {
				// this.showChat();
			} else {
				this.cookieAlert();
			}
		}
	}

	showChat() {
		if (
			window.location.host !==
			'haridusportaal.edu.ee' &&
			window.location.host !== 'test.edu.ee'
		) {
			window['__lc'] = window['__lc'] || {};
			// Initial api-key: 10492167
			window['__lc'].license = 10834647;
			(function () {
				const lc = document.createElement('script');
				lc.type = 'text/javascript';
				lc.async = false;
				lc.src = `${('https:' === document.location.protocol ? 'https://' : 'http://')}cdn.livechatinc.com/tracking.js`;
				const s = document.getElementsByTagName('script')[0];
				s.parentNode.insertBefore(lc, s);
			})();
		}
	}

  gaPageTrack():void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.analytics.trackPage(event);
      }
    });
  }

  ngAfterViewInit(): void {
    // this.cookieAlert();
    this.initCookies();
    this.unregisterServiceWorker();
  }

  /**
   * Temporary function run on initial load to unregister dangling service workers
   * Also remove service worker cache
   */
  private unregisterServiceWorker(): void {
    if (window.navigator && navigator.serviceWorker) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister);
      });
    }
    if ('caches' in window) {
      caches?.keys().then((keyList) => Promise.all(keyList.map((key) => caches.delete(key))));
    }
  }

  ngOnInit() {
    this.sidemenuService.isVisibleSubscription.subscribe((val) => {
      this.sidemenuIsVisible = val;
    });
    /**
     * Reverting anonymous token for now
     */
    // if(!sessionStorage.getItem('ehisToken')) {
    //   console.log('ANONTOKEN');
    //   this.auth.getAnonToken();
    // }

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const path = `${window.location.origin}/amp${window.location.pathname}`;
        this.amp.removeTag('rel=amphtml');
        this.amp.addTag({
          href: path,
          rel: 'amphtml',
        });
      }
    });
    if (environment.GA_TRACKING) {
      this.gaPageTrack();
    }

  }
}
