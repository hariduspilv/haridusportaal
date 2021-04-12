import { Component, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MainProfessionsSearchResultsComponent } from '@app/_assets/mainProfessionsSearchResults/mainProfessionsSearchResults.component';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'mainProfessionList-view',
  templateUrl: 'mainProfessionListView.template.html',
  styleUrls: ['mainProfessionListView.styles.scss'],
})

export class MainProfessionListViewComponent implements AfterViewInit {
  @Input() path: string;
  @ViewChild('filterToggle') filterToggle: ElementRef;
  @ViewChild('searchResults') private searchResults: MainProfessionsSearchResultsComponent;

  jobsQuery: string = 'oskaMainProfessionListView';
  jobQuery: string = 'oskaMainProfessionDetailView';
  jobLoading: boolean = true;
  filteredJob: Object;
  lang: any;
  params: any;
  tags: any;
  oskaFields: any;
  fixedLabels: any;
  fixedLabelSelection: any;
  competitionSelection: any;
  searchTitle = '';
  showFilter = true;
  filterFull = false;
  sortDirection = 'ASC';
  sortField: any;
  sort: any;
  activatedFilters: boolean = false;
  competitionLabels = [
    'oska.simple_extended',
    'oska.quite_simple_extended',
    'oska.medium_extended',
    'oska.quite_difficult_extended',
    'oska.difficult_extended',
  ];
  competitionFilters = [];
  public tooltipTriggerType = 'hover focus';
  public tooltipPlacement = 'right';
  public typeFilters: any = [
    { name: this.translateService.get('oskaProfessions.label'),
      active: true,
      sum: 0,
      tooltipText: this.translateService.get('oska.professions_description'),
    },
    { name: this.translateService.get('oska.sample_jobs'),
      active: true,
      sum: 0,
      tooltipText: this.translateService.get('oska.profession_job_description'),
    },
  ];
  public activeTypeParameters: Record<string, string> = {};
  sortedBy: object[] = [
    { key: 'Kõik', value: '' },
    { key: 'Töötajate arvu järgi kasvavalt', value: 'field_number_of_employees_asc' },
    { key: 'Töötajate arvu järgi kahanevalt', value: 'field_number_of_employees_desc' },
    { key: 'Töökohtade arvu muutuse järgi kasvavalt', value: 'field_change_in_employment_asc' },
    { key: 'Töökohtade arvu muutuse järgi kahanevalt', value: 'field_change_in_employment_desc' },
  ];

  constructor(
    private settings: SettingsService,
    private http: HttpClient,
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private deviceService: DeviceDetectorService,
  ) {}

  setSortDirection() {
    if (this.sort) {
      const directionHelper = this.sort.split('_');
      this.sortDirection = (directionHelper.pop()).toUpperCase();
      this.sortField = directionHelper.join('_');
    } else {
      this.sortField = '';
      this.sortDirection = '';
    }
  }

  ngAfterViewInit() {
    setTimeout(
      () => {
        const responsive = this.filterToggle.nativeElement.clientWidth;
        this.showFilter = responsive ? false : true;
        let fullFilters = responsive ? true : false;
        if (!responsive && this.activatedFilters) {
          fullFilters = true;
        }
        this.filterFull = fullFilters;
      },
      0);
  }

  getGoogleAnalyticsObject() {
    return {
      category: 'mainProfessionSearch',
      action: 'submit',
      label: this.searchTitle,
    };
  }

  getFilters() {

    const variables = {
      lang: 'ET',
      limit: 24,
    };

    const path = this.settings.query('oskaMainProfessionListViewFilter', variables);

    this.competitionLabels.forEach((element, index) => {
      this.competitionFilters.push({ key: this.translateService.get(element), value: (index + 1) });
    });

    const subscribe = this.http.get(path).subscribe((response:any) => {
      const data = response.data;

      this.oskaFields = data.oskaFields.entities.map((el) => {
        return {
          value: el.nid,
          key: el.title,
        };
      });

      this.fixedLabels = data.oskaFixedLabels.entities.map((el) => {
        return {
          value: el.entityId,
          key: el.entityLabel,
        };
      });

      subscribe.unsubscribe();
    });
  }

  toggleFilters(): void {
    const filters = Object.keys(this.route.snapshot.queryParams).filter((item) => {
      if (item !== 'title' && item !== 'oskaField') {
        return item;
      }
    });
    if (filters.length > 0) {
      this.activatedFilters = true;
    }
  }

  public setTypeFilterStates({ queryParams }): void {
    const { fieldProfession } = queryParams;
    if (fieldProfession === '1') {
      this.typeFilters[0].active = false;
      this.typeFilters[1].active = true;
    } else if (fieldProfession === '0') {
      this.typeFilters[0].active = true;
      this.typeFilters[1].active = false;
    } else {
      this.typeFilters[0].active = true;
      this.typeFilters[1].active = true;
    }
  }

  public filterListByType(index: number): void {
    this.typeFilters[index].active = !this.typeFilters[index].active;
    if (!this.typeFilters[0].active && !this.typeFilters[1].active) {
      this.typeFilters.map(filter => filter.active = true);
    }
    const fieldProfession = !this.typeFilters[0].active || !this.typeFilters[1].active
      ? this.typeFilters[1].active && !this.typeFilters[0].active ? '1' : '0'
      : null;
    this.activeTypeParameters = {
      fieldProfession,
    },
    this.router.navigate([], {
      queryParams: {
        ...this.route.snapshot.queryParams,
        fieldProfession,
      },
    });
  }

  ngOnInit() {
    if (!this.deviceService.isDesktop()) {
      this.tooltipTriggerType = 'click';
      this.tooltipPlacement = 'auto';
    }
    this.toggleFilters();
    this.getFilters();
  }
}
