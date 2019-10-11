import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@app/_modules/translate/translate.service';

@Component({
  selector: 'studyProgrammeList-view',
  templateUrl: 'studyProgrammeListView.template.html',
  styleUrls: ['studyProgrammeListView.styles.scss'],
})

export class StudyProgrammeListViewComponent {
  @Input() path: string;
  lang: any;
  params: any;
  tags: any;
  selectedTag: any;
  showFilter = true;
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
  sortDirection = 'ASC';
  sortField: any;
  sort: any;
  openAdmission = true;

  constructor(
    private settings: SettingsService,
    private http: HttpClient,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.getFilters();

    this.getSortOptions();
  }

  setIscedfFilters(type) {
    if (type === 'narrow') {
      this.iscedfNarrowFilters = [];
      this.selectedIscedfBroad.forEach((element) => {
        this.secondaryIscedfFilters[element].forEach((secElement) => {
          this.iscedfNarrowFilters.push(secElement);
        });
      });
      this.removeHangingIscedf(type);
      this.setIscedfFilters('detailed');
    }
    if (type === 'detailed') {
      this.iscedfDetailedFilters = [];
      this.selectedIscedfNarrow.forEach((element) => {
        this.secondaryIscedfFilters[element].forEach((secElement) => {
          this.iscedfDetailedFilters.push(secElement);
        });
      });
      this.removeHangingIscedf(type);
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
    oldValue.forEach((element) => {
      if (options.indexOf(element) !== -1) {
        this[selectionField].push(element);
      }
    });
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
        return { value: el.tid, key: el.entityLabel };
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

      subscribe.unsubscribe();
    });
  }

  setSortDirection() {
    const directionHelper = this.sort.split('_');
    this.sortDirection = (directionHelper.pop()).toUpperCase();
    this.sortField = directionHelper.join('_');
  }

  getSortOptions() {
    this.sortOptions = [
      {
        value: 'title', key: this.translate.get('button.all'),
      },
      {
        value: 'field_duration_asc', key: this.translate.get('studyProgramme.sortby_duration_asc'),
      },
      {
        value: 'field_duration_desc', key: this.translate.get('studyProgramme.sortby_duration_desc'),
      },
    ];
  }
}
