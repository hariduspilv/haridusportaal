import { Component, ViewChild, OnInit, HostListener, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { SideMenuService, RootScopeService } from './_services';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError, ActivatedRoute, RoutesRecognized } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

  @ViewChild('sidenav') sidenav;

  mode: any;
  debounce: any;
  debounceDelay: any;
  isSidenavCloseDisabled: boolean;
  routeSub: any;

  constructor(private sidemenu: SideMenuService, private router: Router, private rootScope: RootScopeService, private route: ActivatedRoute) {

    this.isSidenavCloseDisabled = true;

    this.debounceDelay = 60;

    this.subscription = this.sidemenu.getMessage().subscribe(status => {
      this.sidenav.toggle();
    });

    router.events.subscribe( (event: Event) => {

        if (event instanceof RoutesRecognized) {

          let params = event.state.root.firstChild.params;
          this.rootScope.set('currentLang', params['lang'] );
        }
        if (event instanceof NavigationStart) {
          this.menuStyle();
        }

        if (event instanceof NavigationEnd) {
            // Hide loading indicator
          this.sidemenu.triggerLang();
        }

        if (event instanceof NavigationError) {
            // Hide loading indicator
            // Present error to user
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
