import { Component, Input, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'studyProgrammeList-view',
  templateUrl: 'studyProgrammeListView.template.html',
  styleUrls: ['studyProgrammeListView.styles.scss'],
})

export class StudyProgrammeListViewComponent implements AfterViewInit {
  @Input() path: string;
  @ViewChild('filterToggle', { static: false }) filterToggle: ElementRef;
  @ViewChild('filters', { static: false }) filters: ElementRef;

  lang: any;
  params: any;
  tags: any;
  selectedTag: any;
  showFilter = true;
  filterFull = false;
  typeFilters = [];
  selectedTypes = [];
  levelFilters = [];
  selectedLevels = [];
  iscedfBroadFilters = [];
  selectedIscedfBroad = [];
  iscedfNarrowFilters = [];
  selectedIscedfNarrow = [];
  iscedfDetailedFilters = [];
  selectedIscedfDetailed = [];
  languageFilters = [];
  selectedLanguages = [];
  secondaryIscedfFilters = {};
  sortOptions = [];
  sortDirection = '';
  sortField: any;
  sort: any;
  openAdmission = true;

  constructor(
    private settings: SettingsService,
    private http: HttpClient,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) { }

  ngOnInit() {
    if (!Object.keys(this.route.snapshot.queryParams).length) {

      this.router.navigate(['.'], {
        relativeTo: this.route,
        queryParams: {
          onlyOpenAdmission: true,
        },
        replaceUrl: true,
      });
    }
    this.getFilters();
    this.getSortOptions();
  }

  toggleFilters() {
    this.showFilter = !this.showFilter;
    this.fillFilters();
  }

  fillFilters() {
    let params = { ... this.route.snapshot.queryParams };
    if (params['iscedf_broad']) {
      this.selectedIscedfBroad = params['iscedf_broad'].split(';');
    }
    if (params['iscedf_narrow']) {
      this.selectedIscedfNarrow = params['iscedf_narrow'].split(';');
    }
    if (params['iscedf_detailed']) {
      this.selectedIscedfDetailed = params['iscedf_detailed'].split(';');
    }

    Object.keys(params).forEach((item) => {
      if(
        item === 'title' ||
        item === 'type' ||
        item === 'onlyOpenAdmission'
      ) {
        delete params[item];
      }
    });

    if (Object.keys(params).length) {
      this.filterFull = true;
    }

    this.setIscedfFilters('narrow');
    // this.cdr.detectChanges();
  }

  resetFilters() {
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: {},
    });
  }

  ngAfterViewInit() {
    const responsive = this.filterToggle.nativeElement.clientWidth;
    this.showFilter = responsive ? false : true;
    this.filterFull = responsive ? true : false;
  }

  setIscedfFilters(type) {
    if (type === 'narrow') {
      try {
        this.iscedfNarrowFilters = [];
        this.selectedIscedfBroad.forEach((element) => {
          this.secondaryIscedfFilters[element].forEach((secElement) => {
            this.iscedfNarrowFilters.push(secElement);
          });
        });
        this.removeHangingIscedf(type);
        this.setIscedfFilters('detailed');
      } catch (err) {}
    }
    if (type === 'detailed') {
      try {
        this.iscedfDetailedFilters = [];
        this.selectedIscedfNarrow.forEach((element) => {
          this.secondaryIscedfFilters[element].forEach((secElement) => {
            this.iscedfDetailedFilters.push(secElement);
          });
        });
        this.removeHangingIscedf(type);
      } catch (err) {}
    }
  }

  removeHangingIscedf(type) {
    const field = this.uppercase(type);
    const options = [];
    const filterField = `iscedf${field}Filters`;
    const selectionField = `selectedIscedf${field}`;

    this[filterField].forEach((element) => {
      options.push(element.value);
    });
    const oldValue = this.selectedIscedfNarrow;
    this[selectionField] = [];
    if (oldValue) {
      oldValue.forEach((element) => {
        if (options.indexOf(element) !== -1) {
          this[selectionField].push(element);
        }
      });
    }
  }

  uppercase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  getFilters() {

    let variables = {
      lang: 'ET',
    };

    const path = this.settings.query('studyProgrammeFilterOptions', variables);

    const subscribe = this.http.get(path).subscribe((response: any) => {
      const data = response.data;
      this.typeFilters = data.type.entities.map((el) => {
        return { value: el.tid, key: el.entityLabel };
      });

      this.levelFilters = data.level.entities.map((el) => {
        return { value: String(el.tid), key: el.entityLabel };
      });

      data.isced_f.entities.map((el) => {
        if (!el.parentId) {
          this.iscedfBroadFilters.push({ value: el.entityId, key: el.entityLabel });
        } else {
          if (!this.secondaryIscedfFilters[el.parentId]) {
            this.secondaryIscedfFilters[el.parentId] = [{ value: el.entityId, key: el.entityLabel }];
          } else {
            this.secondaryIscedfFilters[el.parentId].push({ value: el.entityId, key: el.entityLabel });
          }
        }
      });

      this.languageFilters = data.language.entities.map((el) => {
        return { value: el.tid, key: el.entityLabel };
      });

      this.fillFilters();
      subscribe.unsubscribe();
    });
  }

  setSortDirection() {
    if (this.sort) {
      const directionHelper = this.sort.split('_');
      this.sortDirection = (directionHelper.pop()).toUpperCase();
      this.sortField = directionHelper.join('_');
    }
    console.log(this.sort, this.sortDirection, this.sortField);
  }

  getSortOptions() {
    this.sortOptions = [
      {
        value: 'title', key: this.translate.get('button.all'),
      },
      {
        value: 'field_duration_asc',
        key: this.translate.get('studyProgramme.sortby_duration_asc'),
      },
      {
        value: 'field_duration_desc',
        key: this.translate.get('studyProgramme.sortby_duration_desc'),
      },
    ];
  }
}
