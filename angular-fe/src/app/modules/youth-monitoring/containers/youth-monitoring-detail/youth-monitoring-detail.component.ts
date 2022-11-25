import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, distinctUntilChanged, map, mergeMap, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { YouthMonitoringApiService } from '../../youth-monitoring-api.service';
import { getTranslatedWord } from '@app/_core/router-utility';
import { SettingsService } from '@app/_services';
import { YouthMonitoringUtility } from '../../youth-monitoring-utility';
import { YouthMonitoringDetailDto, MappedYouthMonitoringDetailTab, MappedYouthMonitoringDetail } from '../../models/interfaces';
import { slugifyTitle } from '@app/_core/utility';

@Component({
  selector: 'youth-monitoring-detail',
  templateUrl: './youth-monitoring-detail.component.html',
  styleUrls: ['./youth-monitoring-detail.component.scss'],
})
export class YouthMonitoringDetailComponent implements OnDestroy, OnInit {
  private destroy$ = new Subject<void>();
  public loading = true;
  public detailPath: string;
  public activeTab = new BehaviorSubject<number>(0);
  public viewChange = new Subject<string>();
  public tabIcons = YouthMonitoringUtility.icons;
  public tabs: MappedYouthMonitoringDetailTab[] = [];
  public tabs$: Observable<MappedYouthMonitoringDetailTab[]> = this.route.params
    .pipe(takeUntil(this.destroy$), distinctUntilChanged((prev, curr) => prev.id === curr.id), mergeMap((params) => {
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
        }),
        map(
          (response) => YouthMonitoringUtility.mapDetail(response?.data?.route?.entity)
        )
      );
    }));

  public sidebar$: Observable<MappedYouthMonitoringDetail> = this.tabs$.pipe(switchMap((tabs) => {
    return this.activeTab.pipe(switchMap((tabi) => of(tabs[tabi]?.fieldYouthMonitorTabPage)))
  }));

  constructor(
    public service: YouthMonitoringApiService,
    public settings: SettingsService,
    public route: ActivatedRoute,
    private location: Location,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.tabs$.subscribe((tabRes) => {
      this.tabs = tabRes;
      const tabi = tabRes.findIndex((item) => slugifyTitle(item.fieldAccordionTitle) === this.route.snapshot.fragment) ?? 0;
      this.activeTab.next(tabi);

      // Avoid NG0100 error
      setTimeout(() => {
        this.loading = false;
      }, 100);
    });
  }

  private saveLanguageSwitchLinks(response: YouthMonitoringDetailDto): void {
    if (response?.data?.route?.languageSwitchLinks) {
      this.settings.currentLanguageSwitchLinks = response.data.route.languageSwitchLinks;
    }
  }

  public setSideBar(tabLabel: string, tabs: MappedYouthMonitoringDetailTab[]) {
    const slug = slugifyTitle(tabLabel);
    this.activeTab.next(tabs.findIndex((tab) => tab.fieldAccordionTitle === tabLabel) ?? 0);
    this.location.replaceState(`${this.detailPath}#${slug}`);
  }
}

