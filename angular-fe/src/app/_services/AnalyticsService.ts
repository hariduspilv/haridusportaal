import { Injectable } from '@angular/core';
@Injectable()
export class AnalyticsService {

  /**
   * Google analytics tracking by URL
   * @param page - Page url
   */
  public trackPage(page: string) {
    if (page && (<any>window).ga) {
      (<any>window).ga('send', 'pageview', page);
    }
  }

  /**
   * Google analytics tracking by event
   * @param [category] - Event category
   * @param [action] - Action eq. click, mouseover, mouseup, keypress etc.
   * @param [label] - Title of the event
   */
  public trackEvent(category: string = '', action: string = '', label: string = '') {
    if ((<any>window).ga) {
      (<any>window).ga('send', 'event', category, action, label, {
        hitCallback: () => {
        },
      });
    }
  }
}
