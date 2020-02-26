import { Injectable } from '@angular/core';
@Injectable()
export class AnalyticsService {

  public trackPage(page: string) {
    if (page && (<any>window).ga) {
      (<any>window).ga('send', 'pageview', page);
    }
  }

  public trackEvent(category: string = '', action: string = '', label: string = '') {
    if ((<any>window).ga) {
      (<any>window).ga('send', 'event', category, action, label, {
        hitCallback: () => {
        },
      });
    }
  }
}
