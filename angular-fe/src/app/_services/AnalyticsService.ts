import { Injectable } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { GoogleTagManagerService } from 'angular-google-tag-manager';
@Injectable()
export class AnalyticsService {
  constructor(private gtmService: GoogleTagManagerService) {}

  /**
   * Google tag manager tracking by URL
   * @param event - Navigation end event
   */

  public trackPage(event: NavigationEnd) {
    const gtmTag = {
      event: 'page',
      pageName: event.url,
    };
    this.gtmService.pushTag(gtmTag);
  }

  /**
   * Google tag manager tracking by event
   * @param [category] - Event category
   * @param [action] - Action eq. click, mouseover, mouseup, keypress etc.
   * @param [label] - Title of the event
   */
  public trackEvent(category: string = '', action: string = '', label: string = '') {
    const gtmTag = {
      category,
      label,
      event: action,
    };
    this.gtmService.pushTag(gtmTag);
  }
}
