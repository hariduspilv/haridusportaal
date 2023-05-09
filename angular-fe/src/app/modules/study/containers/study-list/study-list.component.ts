import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListOffsetParameters } from '@app/_core/models/list-offset-parameters';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';
import { MappedStudy } from '../../models/mapped-study';
import { MappedStudyFilters } from '../../models/mapped-study-filters';
import { StudyListIntro } from '../../models/study-list-intro';
import { StudyListViewQueryParameters } from '../../models/study-list-view-query-parameters';
import { StudyListViewQueryResponse } from '../../models/study-list-view-query-response';
import { StudyApiService } from '../../study-api.service';
import { StudyUtility } from '../../study-utility';
import { getLangCode } from '@app/_core/router-utility';
import { StudyListViewRequestParameters } from '../../models/study-list-view-request-parameters';
import { Study } from '../../models/study';

@Component({
	selector: 'study-list',
	templateUrl: './study-list.component.html',
	styleUrls: ['./study-list.component.scss'],
})
export class StudyListComponent implements OnInit, OnDestroy {
	private componentDestroyed$ = new Subject();
	public filterOptions$: Observable<MappedStudyFilters> =
		this.filterOptionsAsObservable();
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

	constructor(private api: StudyApiService, private route: ActivatedRoute) {}

	ngOnInit(): void {
		this.route.queryParams
			.pipe(takeUntil(this.componentDestroyed$))
			.subscribe((parameters) => {
				this.resetStudyListOffsetParameters();
				this.studyListViewQuery(parameters);
			});

		this.api
			.studyListIntroQuery(getLangCode())
			.pipe(takeUntil(this.componentDestroyed$))
			.subscribe((res) => (this.intro = res));
	}

	ngOnDestroy(): void {
		this.componentDestroyed$.next(true);
		this.componentDestroyed$.complete();
	}

	loadMoreContent(): void {
		this.offsetParameters.offset += 24;
		this.studyListViewQuery(this.route.snapshot.queryParams, true);
	}

	private studyListViewQuery(
		parameters: StudyListViewQueryParameters,
		loadMoreContent?: boolean
	) {
		this.loading = {
			list: !loadMoreContent,
			loadMore: loadMoreContent,
		};
		const requestParameters =
			StudyUtility.generateStudyListViewRequestParameters(
				parameters,
				this.offsetParameters,
				this.highlight
			);

		const includeHighlight = !loadMoreContent ? this.highlight : undefined;
		const observable = this.highlight
			? this.getStudyList(requestParameters, loadMoreContent, includeHighlight)
			: this.api.studyHighlightedQuery().pipe(
					takeUntil(this.componentDestroyed$),
					catchError(() => of(null)),
					switchMap((response) => {
						if (response?.status === 200) {
							this.highlight = StudyUtility.takeHighlightedStudy(response);
							requestParameters.highlightedStudyNid =
								this.highlight.nid.toString();
						}

						return this.getStudyList(
							requestParameters,
							loadMoreContent,
							this.highlight
						);
					})
			  );

		observable.subscribe({
			complete: () => this.resetLoading(),
		});
	}

	private getStudyList(
		requestParameters: StudyListViewRequestParameters,
		loadMoreContent: boolean,
		highlight?: Study
	) {
		return this.api.studyListViewQuery(requestParameters).pipe(
			takeUntil(this.componentDestroyed$),
			map((response: StudyListViewQueryResponse) => {
				const { entities, count } = response;
				const list = StudyUtility.studyListMappedData(
					this.list,
					entities,
					loadMoreContent
				);
				this.offsetParameters.count = count;
				this.list = highlight ? [highlight, ...list] : list;
			})
		);
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
		return this.api
			.studyListViewFilterQuery(getLangCode().toUpperCase())
			.pipe(
				map((response) => StudyUtility.flattenStudyListFilterOptions(response))
			);
	}
}
