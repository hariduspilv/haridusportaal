import { Component, OnInit } from '@angular/core';
import { MainProfessionApiService } from '../../main-profession-api.service';
import { OskaMainProfessionListParameters, OskaMainProfessionsList } from '../../main-profession.model';

@Component({
  selector: 'main-profession-list',
  templateUrl: './main-profession-list.component.html',
  styleUrls: ['./main-profession-list.component.scss'],
})
export class MainProfessionListComponent implements OnInit {

  constructor(private api: MainProfessionApiService) { }

  mainProfessionList: OskaMainProfessionsList = null;

  mainProfessionListParameters: OskaMainProfessionListParameters = {
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

  ngOnInit(): void {
    this.api.getOskaMainProfessionsList(this.mainProfessionListParameters).subscribe((response) => {
      this.mainProfessionList = response;
    });
  }

}
