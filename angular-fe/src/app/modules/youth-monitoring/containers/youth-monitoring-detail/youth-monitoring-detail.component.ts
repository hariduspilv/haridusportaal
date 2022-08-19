import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, mergeMap, Observable, Subject, takeUntil, tap } from 'rxjs';
import { YouthMonitoringApiService } from '../../youth-monitoring-api.service';
import { getTranslatedWord } from '@app/_core/router-utility';
import { SettingsService } from '@app/_services';
import { YouthMonitoringUtility } from '../../youth-monitoring-utility';
import { YouthMonitoringDetail, YouthMonitoringDetailDto } from '../../models/interfaces';

@Component({
  selector: 'youth-monitoring-detail',
  templateUrl: './youth-monitoring-detail.component.html',
  styleUrls: ['./youth-monitoring-detail.component.scss'],
})
export class YouthMonitoringDetailComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  public loading = true;
  public detailPath: string;
  public detail$: Observable<YouthMonitoringDetail> = this.route.params
    .pipe(takeUntil(this.destroy$), mergeMap((params) => {
      this.loading = true;
      this.detailPath = `/${getTranslatedWord('noorteseire')}/${params.id}`;

      return this.service.getPage(this.detailPath).pipe(
        takeUntil(this.destroy$),
        tap({
          next: (response) => {
            this.saveLanguageSwitchLinks(response);
          },
          error: (error) => {
            console.error(error);
          },
          complete: () => {
            this.loading = false;
          }
        }),
        map(
          (response) => YouthMonitoringUtility.mapDetail(response?.data?.route?.entity)
        ),
        tap((r) => console.log(r))
      );
    }));

  constructor(
    public service: YouthMonitoringApiService,
    public settings: SettingsService,
    public route: ActivatedRoute,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private saveLanguageSwitchLinks(response: YouthMonitoringDetailDto): void {
    if (response?.data?.route?.languageSwitchLinks) {
      this.settings.currentLanguageSwitchLinks = response.data.route.languageSwitchLinks;
    }
  }
}

