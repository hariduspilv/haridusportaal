import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthService, SidemenuService, AlertsService, SettingsService, Alert, AlertType } from './_services';
import { Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { AmpService } from './_services/ampService';
import { TranslateService } from './_modules/translate/translate.service';
import { CookieService } from './_services/CookieService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit, AfterViewInit {

  public sidemenuIsVisible: boolean = false;
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
  ) {
    this.sidemenuIsVisible = sidemenuService.isVisible;
  }
  public onActivate(): void {
    try {
      document.querySelector('.app-content').scrollTo({
        top: 0,
      });
    } catch (err) {}
  }

  closeSidemenu(event: Event) {
    if (this.sidemenuIsVisible) { this.sidemenuService.toggle(); }
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
        const lc = document.createElement('script'); lc.type = 'text/javascript'; lc.async = false;
        // tslint:disable-next-line: max-line-length
        lc.src = `${('https:' === document.location.protocol ? 'https://' : 'http://')}cdn.livechatinc.com/tracking.js`;
        const s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(lc, s);
      })();
    }
  }

  ngAfterViewInit(): void {
    // this.cookieAlert();
    this.initCookies();
  }
  ngOnInit() {
    this.sidemenuService.isVisibleSubscription.subscribe((val) => {
      this.sidemenuIsVisible = val;
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd ){
        const path = `${window.location.origin}/amp${window.location.pathname}`;
        this.amp.removeTag('rel=amphtml');
        this.amp.addTag({
          href: path,
          rel: 'amphtml',
        });
      }
    });
  }
}
