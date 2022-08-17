import { Component, Input } from '@angular/core';
import { MappedYouthMonitoringDetail } from '../../models/interfaces';

@Component({
  selector: 'youth-monitoring-sidebar',
  templateUrl: './youth-monitoring-sidebar.component.html',
  styleUrls: ['./youth-monitoring-sidebar.component.scss']
})
export class YouthMonitoringSidebarComponent {
  @Input() data: MappedYouthMonitoringDetail;
}
