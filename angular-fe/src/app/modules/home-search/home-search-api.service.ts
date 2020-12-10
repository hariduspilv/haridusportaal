import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from '@app/_services';
import { Observable } from 'rxjs';
import { HomeSearch, HomeSearchAutocomplete, HomeSearchParameters } from './home-search.model';

@Injectable({
  providedIn: 'root',
})
export class HomeSearchApiService {

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService) {}

  getHomeSearch(parameters: HomeSearchParameters): Observable<HomeSearch> {
    const path = this.settingsService.query('homeSearch', parameters);
    return this.http.get<HomeSearch>(path);
  }

  getHomeSearchAutocomplete(parameters: HomeSearchParameters): Observable<HomeSearchAutocomplete> {
    const path = this.settingsService.query('testAutocomplete', parameters);
    return this.http.get<HomeSearchAutocomplete>(path);
  }
}
