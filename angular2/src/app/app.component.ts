import { Component, ViewChild, OnInit, HostListener, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { SideMenuService } from './_services';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError, ActivatedRoute, RoutesRecognized } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

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
  debounce: any;
  debounceDelay: any;
  isSidenavCloseDisabled: boolean;
  routeSub: any;

  constructor(
    private sidemenu: SideMenuService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private adapter: DateAdapter<Date>
  ) {
    

    this.isSidenavCloseDisabled = true;

    this.debounceDelay = 60;

    this.subscription = this.sidemenu.getMessage().subscribe(status => {
      this.sidenav.toggle();
    });

    var that = this;

    router.events.subscribe( (event: Event) => {

      if (event instanceof RoutesRecognized) {
        let params = event.state.root.firstChild.params;
        if (params && params.lang) {
          translate.setDefaultLang(params['lang']);
        }
      }
      
      if (event instanceof NavigationStart) {
        this.menuStyle();
      }

      if (event instanceof NavigationEnd) {
          // Hide loading indicator
        this.sidemenu.triggerLang();
      }

      if (event instanceof NavigationError) {
        this.router.navigateByUrl(`/et/404`);
      }
        
    });


  }

  subscription: Subscription;

  ngOnInit() {
    this.menuStyle();
  }

  @HostListener('window:resize', ['$event'])

  onResize(event) {
    this.menuStyle();
  }

  menuStyle() {

    const _that = this;

    clearTimeout( this.debounce );

    this.debounce = setTimeout(function() {

      if ( window.innerWidth >= 900 ) {
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
