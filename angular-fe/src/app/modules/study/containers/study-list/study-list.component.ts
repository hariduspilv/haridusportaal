import { Component, OnInit } from '@angular/core';
import { SortDirection } from '@app/_core/models/enums/sort-direction.enum';
import { Language } from '@app/_core/models/interfaces/language.enum';
import { MappedStudy } from '../../models/mapped-study';
import { StudyListViewQueryParameters } from '../../models/study-list-view-query-parameters';
import { StudyListViewQueryResponse } from '../../models/study-list-view-query-response';
import { StudyApiService } from '../../study-api.service';
import { StudyUtility } from '../../study-utility';

@Component({
  selector: 'study-list',
  templateUrl: './study-list.component.html',
  styleUrls: ['./study-list.component.scss'],
})
export class StudyListComponent implements OnInit {
  public studyList: MappedStudy[];

  public studyListViewQueryParameters: StudyListViewQueryParameters = {
    titleValue: '%%',
    titleEnabled: false,
    publicationTypeEnabled: false,
    publicationLanguageEnabled: false,
    publisherEnabled: false,
    studyLabelEnabled: false,
    studyTopicEnabled: false,
    dateToEnabled: false,
    dateFromEnabled: false,
    highlightedStudyEnabled: false,
    sortField: 'created',
    indicatorSort: false,
    sortDirection: SortDirection.DESC,
    nidEnabled: false,
    limit: 24,
    offset: 0,
    lang: Language.et,
  };

  constructor(private api: StudyApiService) { }

  ngOnInit(): void {
    this.studyListViewQuery();
  }

  private studyListViewQuery() {
    this.api.studyListViewQuery(this.studyListViewQueryParameters).subscribe((response: StudyListViewQueryResponse) => {
      this.studyList = StudyUtility.mapStudyListViewEntities(response.data.nodeQuery.entities);
      console.log(this.studyList);
    });
  }

}
