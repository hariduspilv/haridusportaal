import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from '@app/_services';
import { Observable, of } from 'rxjs';
import {
	YouthMonitoringDetailDto,
	YouthMonitoringListDto,
} from './models/interfaces';

@Injectable()
export class YouthMonitoringApiService {
	constructor(private settings: SettingsService, private http: HttpClient) {}

	public getList(): Observable<YouthMonitoringListDto> {
		return this.http.get<YouthMonitoringListDto>(
			`${this.settings.url}/api/list?_format=json&content_type=youth_monitoring_page_tabbed`
		);
	}

	public getPage(path: string): Observable<YouthMonitoringDetailDto> {
		return this.http.get<YouthMonitoringDetailDto>(
			this.settings.query('getYouthMonitoringPageTabbed', { path })
		);
	}
}
