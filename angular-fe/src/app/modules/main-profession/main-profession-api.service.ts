import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from '@app/_services';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OskaMainProfessionFilter, OskaMainProfessionsList } from './main-profession.model';

@Injectable({
  providedIn: 'root',
})
export class MainProfessionApiService {

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService) {}

  getOskaMainProfessionsList(parameters: {}): Observable<OskaMainProfessionsList> {
    const path = this.settingsService.query('oskaMainProfessionListView', parameters);
    return this.http.get<OskaMainProfessionsList>(path);
  }

  getOskaMainProfessionsListFilter(parameters: {}): Observable<OskaMainProfessionFilter> {
    const path = this.settingsService.query('oskaMainProfessionListViewFilter', parameters);
    return this.http.get<OskaMainProfessionFilter>(path);
  }
}
