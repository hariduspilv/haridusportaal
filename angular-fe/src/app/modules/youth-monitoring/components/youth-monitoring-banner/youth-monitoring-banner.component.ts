import { Component, Input } from '@angular/core';

@Component({
  selector: 'youth-monitoring-banner',
  templateUrl: './youth-monitoring-banner.component.html',
  styleUrls: ['./youth-monitoring-banner.component.scss']
})
export class YouthMonitoringBannerComponent {
  @Input() title: string;
  @Input() body: string;

  constructor() { }
}
