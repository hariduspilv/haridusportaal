import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from '@app/_services';
import { Observable } from 'rxjs';
import { StudyListViewFilterQueryResponse } from './models/study-list-view-filter-query-response';
import { StudyListViewQueryResponse } from './models/study-list-view-query-response';
import { StudyListViewRequestParameters } from './models/study-list-view-request-parameters';
import { StudyDetailViewQuery } from '@app/modules/study/models/study-detail-view-query';
import { StudyListIntro } from './models/study-list-intro';
import { StudyListViewHighlightedResponse } from './models/study-list-view-highlighted-response';

@Injectable({
	providedIn: 'root',
})
export class StudyApiService {
	constructor(
		private http: HttpClient,
		private settingsService: SettingsService
	) {}

	studyHighlightedQuery(): Observable<StudyListViewHighlightedResponse> {
		return this.http.get<StudyListViewHighlightedResponse>(
			`${this.settingsService.url}/api/highlighted_research?_format=json&lang=${this.settingsService.currentAppLanguage}`
		);
	}

	studyListViewQuery(
		parameters: StudyListViewRequestParameters
	): Observable<StudyListViewQueryResponse> {
		const params = this.settingsService.queryParams(parameters);
		return this.http.get<StudyListViewQueryResponse>(
			`${this.settingsService.url}/api/list?_format=json&content_type=studypage&${params}`
		);
	}

	studyListIntroQuery(lang: string): Observable<StudyListIntro> {
		const path = this.settingsService.query('studyListViewIntro', { lang });
		return this.http.get<StudyListIntro>(path);
	}

	studyListViewFilterQuery(
		lang: string
	): Observable<StudyListViewFilterQueryResponse> {
		const path = this.settingsService.query('studyListViewFilterQuery', {
			lang,
		});
		return this.http.get<StudyListViewFilterQueryResponse>(path);
	}

	studyDetailViewQuery(path: string): Observable<StudyDetailViewQuery> {
		const graphqlRequest = this.settingsService.query('studyDetailViewQuery', {
			path,
		});
		return this.http.get<StudyDetailViewQuery>(graphqlRequest);
	}
}
