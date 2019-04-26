import { Component, ViewChild, OnInit, HostListener, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { SideMenuService, RootScopeService } from './_services';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError, ActivatedRoute, RoutesRecognized } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { SettingsService } from '@app/_services/settings.service';
import { CookieService } from './_services/cookieService';
import { HttpService } from '@app/_services/httpService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss', '../../node_modules/snazzy-info-window/dist/snazzy-info-window.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'et'},
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ],
  
})
export class AppComponent implements OnInit {

  @ViewChild('sidenav') sidenav;

  mode: any;
  isLandingPage: boolean = false;
  opened: any;
  debounce: any;
  debounceDelay: any;
  isSidenavCloseDisabled: boolean;
  routeSub: any;
  wasClicked: boolean = false;

  constructor(
    private sidemenu: SideMenuService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private adapter: DateAdapter<Date>,
    private rootScope: RootScopeService,
    private http: HttpService,
    private settings: SettingsService,
    private cookies: CookieService
  ) {

    this.http.xcsrf().subscribe(data => {
      sessionStorage.setItem('xcsrfToken', data);
    });

    rootScope.set('lang', 'et');

    this.isSidenavCloseDisabled = true;

    this.debounceDelay = 60;

    this.subscription = this.sidemenu.getMessage().subscribe(status => {
      this.sidenav.toggle();
    });

    var that = this;

    router.events.subscribe( (event: Event) => {

      if (event instanceof RoutesRecognized) {
        let params = event.state.root.firstChild.params;
        this.isLandingPage = (event.url === '/oska' || event.url === '/');
        if (params && params.lang && (params.lang === 'et' || params.lang === 'en')) {
          translate.setDefaultLang(params['lang']);
        }
      }
      
      if (event instanceof NavigationStart) {
        this.menuStyle();
      }

      if (event instanceof NavigationEnd) {
          // Hide loading indicator
        //this.sidemenu.triggerLang();
        window.scrollTo(0, 0);
      }

      if (event instanceof NavigationError) {
        console.log('NavigationError: Previous route doesn`t exist or is broken. Look into the code inside ngOnDestroy. Might be a logic error. Did you unsubscribe on something there wasnt a subscription?');
        // this.router.navigateByUrl(`/404`, {replaceUrl: true});
      }
        
    });


  }

  subscription: Subscription;

  showCookieNotification = false;

  closeNotification() {
    this.showCookieNotification = false;
  }
  
  agreeTerms() {
    this.cookies.authorize();
    this.showCookieNotification = false;
    this.showChat();
  }

  initCookies(){
    let cookiesAuth = this.cookies.isAuthorized();

    if( cookiesAuth !== 'not_allowed' ){
      if( cookiesAuth ){
        //this.showChat();
      }else{
        this.showCookieNotification = true;
      }
    }
  }
  
  showChat(){
    if (window.location.host !== 'haridusportaal.edu.ee' && window.location.host !== 'test.edu.ee') {
      window['__lc'] = window['__lc'] || {};
      // Initial api-key: 10492167
      window['__lc'].license = 10834647;
      (function() {
        var lc = document.createElement('script'); lc.type = 'text/javascript'; lc.async = false;
        lc.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'cdn.livechatinc.com/tracking.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(lc, s);
      })();
    }
  }

  ngOnInit() {

    this.showChat();
    this.initCookies();

    this.menuStyle();
  }

  @HostListener('window:resize', ['$event'])

  onResize(event) {
    this.menuStyle();
  }

  focusMainContent() {
    document.getElementById('mainContent').focus()
  }

  menuStyle() {

    const _that = this;

    clearTimeout( this.debounce );

    this.debounce = setTimeout(function() {

      if ( window.innerWidth >= 1024 ) {
        _that.sidenav.open();
        _that.mode = 'side';
        _that.isSidenavCloseDisabled = true;
      } else {
        _that.sidenav.close();
        _that.mode = 'over';
        _that.isSidenavCloseDisabled = false;
      }
    } , _that.debounceDelay);
  }
}
