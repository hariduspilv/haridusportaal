import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { YouthMonitoringApiService } from '../../youth-monitoring-api.service';
import { SettingsService } from '@app/_services';

@Component({
  selector: 'youth-monitoring-detail-data',
  templateUrl: './youth-monitoring-detail-data.component.html',
  styleUrls: ['./youth-monitoring-detail-data.component.scss'],
})
export class YouthMonitoringDetailDataComponent {
  @Input() public detail;

  constructor(
    public service: YouthMonitoringApiService,
    public settings: SettingsService,
    public route: ActivatedRoute,
  ) {}
}

