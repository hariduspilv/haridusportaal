import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Language } from '@app/_core/models/interfaces/language.enum';
import { MappedStudy } from '../../models/mapped-study';
import { MappedStudyFilters } from '../../models/mapped-study-filters';
import { StudyListViewFilterQueryResponse } from '../../models/study-list-view-filter-query-response';
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
  public studyListFilterOptions: MappedStudyFilters;

  constructor(
    private api: StudyApiService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.getStudyFilterOptions();
    this.route.queryParams.subscribe((params) => {
      this.studyListViewQuery(params);
    });
  }

  private studyListViewQuery(params: StudyListViewQueryParameters) {
    const requestParameters = StudyUtility.generateStudyListViewRequestParameters(params);
    this.api.studyListViewQuery(requestParameters).subscribe((response: StudyListViewQueryResponse) => {
      this.studyList = StudyUtility.mapStudyListViewEntities(response.data.nodeQuery.entities);
    });
  }

  private getStudyFilterOptions() {
    this.api.studyListViewFilterQuery(Language.et).subscribe((response: StudyListViewFilterQueryResponse) => {
      this.studyListFilterOptions = StudyUtility.flattenStudyListFilterOptions(response);
    });
  }

}
