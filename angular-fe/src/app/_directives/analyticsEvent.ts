import { Directive, HostListener, Input } from '@angular/core';
import { AnalyticsService } from '@app/_services';

@Directive({
  selector: '[eventTracker]',
})
export class AnalyticsEvent {

  constructor (
    private analytics: AnalyticsService,
  ) {}

  @Input('eventTracker') option: any;

  @HostListener('click', ['$event']) onClick($event) {
    this.analytics.trackEvent(this.option.category, this.option.action, this.option.label);
  }

}
