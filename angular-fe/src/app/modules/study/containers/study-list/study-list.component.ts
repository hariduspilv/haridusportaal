import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Language } from '@app/_core/models/interfaces/language.enum';
import { ListOffsetParameters } from '@app/_core/models/list-offset-parameters';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
export class StudyListComponent implements OnInit, OnDestroy {
  private componentDestroyed$ = new Subject();
  public list: MappedStudy[];
  public filterOptions: MappedStudyFilters;
  public loading: Record<string, boolean> = {
    list: true,
    loadMore: false,
  };
  public offsetParameters: ListOffsetParameters = {
    limit: 24,
    offset: 0,
    count: 0,
  };
  public highlight: MappedStudy;

  constructor(
    private api: StudyApiService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.getStudyFilterOptions();
    this.route.queryParams
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe((parameters) => {
      this.resetStudyListOffsetParameters();
      this.studyListViewQuery(parameters);
    });
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  loadMoreContent(): void {
    this.offsetParameters.offset += 24;
    this.studyListViewQuery(this.route.snapshot.queryParams, true);
  }

  private studyListViewQuery(parameters: StudyListViewQueryParameters, loadMoreContent?: boolean) {
    this.loading = {
      list: !loadMoreContent,
      loadMore: loadMoreContent,
    };
    const requestParameters = StudyUtility.generateStudyListViewRequestParameters(
      parameters, this.offsetParameters);
    this.api.studyListViewQuery(requestParameters)
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe((response: StudyListViewQueryResponse) => {
      const { entities, count } = response.data.nodeQuery;
      this.offsetParameters.count = count;
      this.list = StudyUtility.joinResponseWithPreviousValues(this.list, entities, loadMoreContent);
      if (!loadMoreContent) {
        this.unshiftHighlightToList();
      }
      this.resetLoading();
    }, () => {
      this.resetLoading();
    });
  }

  private unshiftHighlightToList(): void {
    this.highlight = StudyUtility.extractRandomHighlightedStudy(this.list);
    this.list = this.highlight ? [this.highlight, ...this.list.filter(study => study !== this.highlight)] : this.list;
  }

  private resetLoading(): void {
    this.loading = {
      list: false,
      loadMore: false,
    };
  }

  private resetStudyListOffsetParameters(): void {
    this.offsetParameters = {
      limit: 24,
      offset: 0,
      count: 0,
    };
  }

  private getStudyFilterOptions() {
    this.api.studyListViewFilterQuery(Language.et)
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe((response: StudyListViewFilterQueryResponse) => {
      this.filterOptions = StudyUtility.flattenStudyListFilterOptions(response);
    });
  }

}
