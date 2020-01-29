import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Router, NavigationStart, Event, NavigationEnd } from '@angular/router';

export interface ListRestorationType {
  values: Object;
  list: Object[];
  canLoadMore: boolean;
}
@Injectable({
  providedIn: 'root',
})

export class ScrollRestorationService {
  public restorationValues = new BehaviorSubject<{ [type: string]: ListRestorationType }>(null);
  public restorationPosition = new BehaviorSubject<{ [type: string]: number }>(null);
  public routerSub: Subscription;
  public popstateNavigation: boolean;

  constructor(private router: Router) {
    this.routerSub = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.popstateNavigation = event.navigationTrigger === 'popstate';
      }
    });
  }
}
