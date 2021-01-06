import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from '@app/_services';
import { Observable } from 'rxjs';
import { ClassifierDefinitionCode } from './models/classifier-definition-code.enum';
import { ClassifierItemsQuery } from './models/classifier-items-query';
import { ClassifierItemsQueryItem } from './models/classifier-items-query-item';

@Injectable({
  providedIn: 'root',
})
export class ClassifiersApi {
  private classifiersUrl = `${this.settings.ehisUrl}/classifiers/`;

  constructor(
    private httpClient: HttpClient,
    private settings: SettingsService) {
  }

  fetchClassifierItemByItemCodeWithParameters(
    itemCode: string, params?: Record<string, string>,
  ): Observable<ClassifierItemsQueryItem> {
    const url = `${this.classifiersUrl}classifierItem/${itemCode}`;

    return this.httpClient.get<ClassifierItemsQueryItem>(url, { params: { ...params } });
  }

  fetchClassifierItemsByDefinitionCode(
    definitionCode: ClassifierDefinitionCode,
  ): Observable<ClassifierItemsQuery> {
    const url = `${this.classifiersUrl}classifierItems/${definitionCode}`;

    return this.httpClient.get<ClassifierItemsQuery>(url);
  }

  fetchClassifierItemsByDefinitionCodeWithParameters(
    definitionCode: ClassifierDefinitionCode, params?: Record<string, string>
  ): Observable<ClassifierItemsQuery> {
    const url = `${this.classifiersUrl}classifierItems/${definitionCode}`;

    return this.httpClient.get<ClassifierItemsQuery>(url, { params: { ...params } });
  }
}
