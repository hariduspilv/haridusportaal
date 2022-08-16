import { Component, OnInit } from '@angular/core';
import { map, take } from 'rxjs';
import { YouthMonitoringApiService } from '../../youth-monitoring-api.service';
import { YouthMonitoringUtility } from '../../youth-monitoring-utility';

@Component({
  selector: 'youth-monitoring-list',
  templateUrl: './youth-monitoring-list.component.html',
  styleUrls: ['./youth-monitoring-list.component.scss'],
})
export class YouthMonitoringListComponent implements OnInit {
  public data: any[];

  constructor(public service: YouthMonitoringApiService) {}

  ngOnInit(): void {
    this.getData();
  }

  private getData(): void {
    this.service
      .getList()
      .pipe(take(1), map((items) => YouthMonitoringUtility.transformDropdownData(items)))
      .subscribe((list) => {
        this.data = list;
      });
  }
}
