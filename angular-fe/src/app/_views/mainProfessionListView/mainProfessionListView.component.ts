import { Component, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { ActivatedRoute } from '@angular/router';
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

  private resetFilters() {
    this.typeFilters = this.typeFilters.map((elem) => {
      elem['active'] = true;
      return elem;
    });
    this.searchResults.filterListByTypes(this.typeFilters);
  }

  private setFilterCounts(list: any[]): void {
    const jobCount: number = list.filter(elem => elem.fieldProfession).length;
    this.typeFilters[0].sum = list.length - jobCount;
    this.typeFilters[1].sum = jobCount;
    this.searchResults.filterListByTypes(this.typeFilters);
  }

  public filterListByType(index) {
    if (!(index === 0 && !this.typeFilters[1].active ||
      index === 1 && !this.typeFilters[0].active) &&
      !(index === 0 && !this.typeFilters[1].sum && this.typeFilters[0].active) &&
      !(index === 1 && !this.typeFilters[0].sum && this.typeFilters[1].active)) {
      this.typeFilters[index].active = !this.typeFilters[index].active;
    }
    this.searchResults.filterListByTypes(this.typeFilters);
  }

  public selectArbitraryHighlightedJob({ list, highlight, activeFilters }): void {
    this.jobLoading = true;
    const filtersExist = Object.keys(this.route.snapshot.queryParams).length;
    if (list && list.length) {
      this.typeFilters = activeFilters || this.typeFilters;
      if (highlight) {
        this.filteredJob = highlight;
        this.setFilterCounts(list);
        this.jobLoading = false;
      } else {
        this.setFilterCounts(list);
        if (!this.filteredJob || !filtersExist) {
          const filteredList: Object[] = list.filter(elem =>
            elem.fieldFillingBar === 1 || elem.fieldFillingBar === 2);
          if (filteredList.length) {
            const filteredItem: number = Math.floor(Math.random() * filteredList.length);
            const initialFilteredJob = filteredList[filteredItem];
            const initialFilteredJobPath = initialFilteredJob['entityUrl'] ? initialFilteredJob['entityUrl']['path']
            : initialFilteredJob['url']['path'];
            const jobSubscription = this.http.get(
              this.settings.query(this.jobQuery, { path: initialFilteredJobPath })).subscribe(
              (response) => {
                this.filteredJob = response['data']['route']['entity'];
                this.filteredJob['path'] = initialFilteredJobPath;
                this.filteredJob['label'] =
                  this.competitionLabels[initialFilteredJob['fieldFillingBar'] - 1];
                this.jobLoading = false;
                jobSubscription.unsubscribe();
              }, () => {
                this.jobLoading = false;
              });
          } else {
            this.jobLoading = false;
          }
        } else {
          this.jobLoading = false;
        }
      }
    } else {
      this.setFilterCounts(list);
      this.jobLoading = false;
    }
    if (list && filtersExist && !highlight) {
      this.resetFilters();
    }
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
