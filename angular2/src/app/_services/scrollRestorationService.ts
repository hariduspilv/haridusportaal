import { Injectable } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, Event } from '@angular/router';
import { RootScopeService } from './rootScopeService';
import { Subscription } from 'rxjs';

@Injectable()
export class ScrollRestorationService {
  
  public scrollableRoutes: Array<String> = ['/uudised', '/sündmused', '/erialad', '/kool', '/ametialad', '/valdkonnad', '/otsing'];
  public currentRoute: string = '';
  public previousRoute: string = '';
  public data: Object = {};
  public routerSub: Subscription;

  constructor(private router: Router, private rootScope: RootScopeService) {
    this.routerSub = this.router.events.subscribe( (event: Event) => {
      if (event instanceof NavigationStart) {
        this.currentRoute = decodeURI(window.location.pathname);
        const pathName = event.url.split('?')[0];
        // Initialize current active scrollable route data;
        if (this.currentRoute !== decodeURI(pathName) && this.scrollableRoutes.includes(decodeURI(pathName))) {
          this.currentRoute = decodeURI(pathName);
          let data = {
            state: false,
            url: this.currentRoute,
            position: 0
          };
          this.setRouteData(data);
        }
        // Set current active scrollable route data if routed away from list(list is previous)
        if (this.scrollableRoutes.includes(this.previousRoute) && this.previousRoute === this.currentRoute) {
          let data = {
            state: rootScope.get('scrollRestorationState'),
            url: this.currentRoute,
            position: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
          };
          this.setRouteData(data);
        // Reset data on imperative navigation
        } else if (event.navigationTrigger !== 'popstate' && this.scrollableRoutes.includes(this.currentRoute) && this.previousRoute.includes(this.currentRoute)) {
          this.reset();
        }
      }
      if (event instanceof NavigationEnd) {
        const pathName = event.url.split('?')[0];
        this.previousRoute = decodeURI(pathName);
      }
    });

  }

  setRouteData(data) {
    for (const [key, value] of Object.entries(data)) {
      this.setRouteKey(key, value);
    }
  }
  getRoute(key) {
    return this.data[key];
  }
  setRouteKey(key, value) {
    if (this.currentRoute && !this.data[this.currentRoute]) this.data[this.currentRoute] = {};
    try {
      this.data[this.currentRoute][key] = value;
    } catch {
      console.error('Setter error')
    }
  }
  getRouteKey(key) {
    try {
      return this.data[this.currentRoute][key];
    } catch {
      console.error('Getter error');
      return false;
    }
  }

  setScroll() {
    let scrollData = this.getRoute(this.currentRoute);
    if (scrollData && this.rootScope.get('scrollRestorationState')) {
      window.scrollTo(0, scrollData.position);
    }
  }
  
  reset() {
    if (this.data[this.currentRoute]) {
      this.data[this.currentRoute].limit = 24;
      this.data[this.currentRoute].position = 0;
      this.data[this.currentRoute].state = false;
      this.rootScope.set('scrollRestorationState', false);
    }
  }

}