import { Component } from '@angular/core';
import { map, Observable, take, tap } from 'rxjs';
import { YouthMonitoringApiService } from '../../youth-monitoring-api.service';
import { YouthMonitoringUtility } from '../../youth-monitoring-utility';

@Component({
  selector: 'youth-monitoring-list',
  templateUrl: './youth-monitoring-list.component.html',
  styleUrls: ['./youth-monitoring-list.component.scss'],
})
export class YouthMonitoringListComponent {
  public loading = true;
  public data$: Observable<any> = this.service
    .getList()
    .pipe(
      take(1),
      tap(() => {
        this.loading = false;
      }),
      map((response) => YouthMonitoringUtility.mapDropdownData(response))
    );

  constructor(public service: YouthMonitoringApiService) {}
}
