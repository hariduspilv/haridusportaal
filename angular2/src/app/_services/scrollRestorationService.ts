import { Injectable, HostListener } from '@angular/core';
import { Router, RoutesRecognized, NavigationStart, Event } from '@angular/router';
import { RootScopeService } from './rootScopeService';

@Injectable()
export class ScrollRestorationService {
  
  public scrollableRoutes: Array<String> = ['/uudised'];
  public currentIsIncluded: boolean = false;
  public currentRoute: string = '';
  public data: Object = {};

  constructor(router: Router, rootScope: RootScopeService) {
    this.routeIncluded(window.location.pathname);
    if (this.currentIsIncluded) {
      let data = {
        state: false,
        url: this.currentRoute,
        position: window.scrollY
      };
      this.setRouteData(data);
    }

    router.events.subscribe( (event: Event) => {
      if (event instanceof RoutesRecognized) {
        this.routeIncluded(event.url.split('?')[0]);
      }
      if (event instanceof NavigationStart) {
        if (this.currentIsIncluded) {
          let data = {
            state: rootScope.get('scrollRestorationState'),
            url: this.currentRoute,
            position: window.scrollY ? window.scrollY : this.data[this.currentRoute].position
          };
          this.setRouteData(data);
        }
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

  routeIncluded(route) {
    this.currentIsIncluded = this.scrollableRoutes.includes(route);
    if (this.currentIsIncluded) {
      this.currentRoute = route;
    }
  }

}