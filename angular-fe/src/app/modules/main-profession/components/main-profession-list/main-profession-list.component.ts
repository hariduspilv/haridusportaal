import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MainProfessionApiService } from '../../main-profession-api.service';
import { OskaMainProfessionFilter, OskaMainProfessionListParameters, OskaMainProfessionsList } from '../../main-profession.model';
import { MainProfessionService } from '../../main-profession.service';

@Component({
  selector: 'main-profession-list',
  templateUrl: './main-profession-list.component.html',
  styleUrls: ['./main-profession-list.component.scss'],
})
export class MainProfessionListComponent implements OnInit {

  constructor(
    private api: MainProfessionApiService,
    private service: MainProfessionService) { }

  breadcrumbs: Record<string, string>[] = [
    {
      title: 'Avaleht',
      link: '/',
    },
    {
      title: 'Ametialad',
    },
  ];

  mainProfessionList: OskaMainProfessionsList = null;
  mainProfessionFilter: OskaMainProfessionFilter = null;
  mainProfessionFilterForm: FormGroup;

  listParameters: OskaMainProfessionListParameters = {
    nidEnabled: false,
    titleValue: '',
    titleEnabled: false,
    oskaFieldValue: [],
    oskaFieldEnabled: false,
    fixedLabelValue: [],
    fixedLabelEnabled: false,
    fillingBarValues: [],
    fillingBarFilterEnabled: false,
    sortField: 'title',
    sortDirection: 'ASC',
    indicatorSort: false,
    limit: 1000,
    offset: 0,
    lang: 'ET',
  };
  filterParameters: Partial<OskaMainProfessionListParameters> = {
    lang: 'ET',
    limit: 24,
  };

  ngOnInit(): void {
    this.api.getOskaMainProfessionsList(this.listParameters).subscribe((response) => {
      this.mainProfessionList = response;
    });
    this.service.getOskaMainProfessionsFilter(this.filterParameters).subscribe((response) => {
      console.log(response);
    });
    this.mainProfessionFilterForm = this.service.getOskaMainProfessionsFilterForm(null);
  }
}
