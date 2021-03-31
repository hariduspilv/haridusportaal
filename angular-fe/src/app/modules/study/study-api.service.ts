import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from '@app/_services';
import { Observable } from 'rxjs';
import { StudyListViewFilterQueryResponse } from './models/study-list-view-filter-query-response';
import { StudyListViewQueryParameters } from './models/study-list-view-query-parameters';
import { StudyListViewQueryResponse } from './models/study-list-view-query-response';

@Injectable({
  providedIn: 'root',
})
export class StudyApiService {

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService) {}

  studyListViewQuery(parameters: StudyListViewQueryParameters): Observable<StudyListViewQueryResponse> {
    const path = this.settingsService.query('studyListViewQuery', parameters);
    return this.http.get<StudyListViewQueryResponse>(path);
  }

  studyListViewFilterQuery(lang: string): Observable<StudyListViewFilterQueryResponse> {
    const path = this.settingsService.query('studyListViewFilterQuery', { lang });
    return this.http.get<StudyListViewFilterQueryResponse>(path);
  }
}
