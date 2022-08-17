import { Component, Input, OnInit } from '@angular/core';
import { YouthMonitoringMappedDetail } from '../../models/interfaces';

@Component({
  selector: 'youth-monitoring-sidebar',
  templateUrl: './youth-monitoring-sidebar.component.html',
  styleUrls: ['./youth-monitoring-sidebar.component.scss']
})
export class YouthMonitoringSidebarComponent implements OnInit {
  @Input() data: YouthMonitoringMappedDetail;

  constructor() { }

  ngOnInit(): void {
  }

}
