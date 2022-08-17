import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, mergeMap, Observable, skip, Subject, takeUntil, tap } from 'rxjs';
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
        tap({
          next: (response) => {
            this.loading = false;
            this.saveLanguageSwitchLinks(response);
          },
          error: (error) => {
            console.error(error);
            this.loading = false;
          }
        }),
        takeUntil(this.destroy$),
        map(
          (response) => YouthMonitoringUtility.mapDetail(response?.data?.route?.entity)
        )
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

