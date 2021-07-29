import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Language } from '@app/_core/models/interfaces/language.enum';
import { ListOffsetParameters } from '@app/_core/models/list-offset-parameters';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { MappedStudy } from '../../models/mapped-study';
import { MappedStudyFilters } from '../../models/mapped-study-filters';
import { StudyListIntro } from '../../models/study-list-intro';
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
  public filterOptions$: Observable<MappedStudyFilters> = this.filterOptionsAsObservable();
  public list: MappedStudy[];
  public intro: StudyListIntro;
  public highlight: MappedStudy;
  public loading: Record<string, boolean> = {
    list: true,
    loadMore: false,
  };
  public offsetParameters: ListOffsetParameters = {
    limit: 24,
    offset: 0,
    count: 0,
  };

	constructor(
		private api: StudyApiService,
		private route: ActivatedRoute,
	) {
	}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe((parameters) => {
      this.resetStudyListOffsetParameters();
      this.studyListViewQuery(parameters);
    });

    this.api.studyListIntroQuery(Language.et)
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe((res) => this.intro = res);
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
      const { list, highlight } = StudyUtility.studyListMappedData(this.list, entities, loadMoreContent);
      this.offsetParameters.count = count;
      this.list = list;
      this.highlight = highlight;
      this.resetLoading();
    }, () => {
      this.resetLoading();
    });
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

  private filterOptionsAsObservable() {
    return this.api.studyListViewFilterQuery(Language.et)
      .pipe(map(response => StudyUtility.flattenStudyListFilterOptions(response)));
  }

}
