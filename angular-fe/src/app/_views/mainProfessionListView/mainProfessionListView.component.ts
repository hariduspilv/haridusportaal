import { Component, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';
import { HttpClient } from '@angular/common/http';
import FieldVaryService from '@app/_services/FieldVaryService';
import { TranslateService } from '@app/_modules/translate/translate.service';

@Component({
  selector: 'mainProfessionList-view',
  templateUrl: 'mainProfessionListView.template.html',
  styleUrls: ['mainProfessionListView.styles.scss'],
})

export class MainProfessionListViewComponent implements AfterViewInit {
  @Input() path: string;
  @ViewChild('filterToggle', { static: false }) filterToggle: ElementRef;

  lang: any;
  params: any;
  tags: any;
  oskaFields: any;
  fixedLabels: any;
  fixedLabelSelection: any;
  competitionSelection: any;
  showFilter = true;
  filterFull = false;
  sortDirection = 'ASC';
  sortField: any;
  sort: any;
  competitionLabels = ['oska.simple_extended', 'oska.quite_simple_extended', 'oska.medium_extended', 'oska.quite_difficult_extended', 'oska.difficult_extended'];
  competitionFilters = [];
  sortedBy: Array<Object> = [
    { key: 'Kõik', value: '' },
    { key: 'Brutopalga järgi kasvavalt', value: 'field_bruto_asc' },
    { key: 'Brutopalga järgi kahanevalt', value: 'field_bruto_desc' },
    { key: 'Hariduse pakkumise järgi kasvavalt', value: 'field_education_indicator_asc' },
    { key: 'Hariduse pakkumise järgi kahanevalt', value: 'field_education_indicator_desc' },
    { key: 'Hõivatute arvu järgi kasvavalt', value: 'field_number_of_employees_asc' },
    { key: 'Hõivatute arvu järgi kahanevalt', value: 'field_number_of_employees_desc' },
    { key: 'Hõive muutuse järgi kasvavalt', value: 'field_change_in_employment_asc' },
    { key: 'Hõive muutuse järgi kahanevalt', value: 'field_change_in_employment_desc' }
  ];

  constructor(
    private settings: SettingsService,
    private http: HttpClient,
    private translateService: TranslateService,
  ) {}

  ngOnInit() {
    this.getFilters();
  }

  setSortDirection() {
    const directionHelper = this.sort.split('_');
    this.sortDirection = (directionHelper.pop()).toUpperCase();
    this.sortField = directionHelper.join('_');
  }

  ngAfterViewInit() {
    this.showFilter = this.filterToggle.nativeElement.clientWidth ? false : true;
    this.filterFull = true;
  }

  getFilters() {

    let variables = {
      lang: 'ET',
      limit: 24,
    };

    const path = this.settings.query('oskaMainProfessionListViewFilter', variables);

    this.competitionLabels.forEach((element, index) => {
      this.competitionFilters.push({ key: this.translateService.get(element), value: index });
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
}
