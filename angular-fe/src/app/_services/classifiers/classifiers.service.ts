import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { ClassifierDefinitionCode } from '@app/_enums/classifier/ClassifierDefinitionCode';
import { ClassifierItemsQuery } from '@app/_interfaces/classifiers/ClassifierItemsQuery';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '../SettingsService';

@Injectable({
  providedIn: 'root'
})
export class ClassifiersService {
  baseUrl = `${this.settingsService.ehisUrl}/classifiers/classifierItems/`;

  constructor(private http: HttpClient, private httpClient: HttpClient, private settingsService: SettingsService) {
  }

  fetchClassifierItemsByDefinitionCode(
    definitionCode: ClassifierDefinitionCode
  ): Observable<ClassifierItemsQuery> {
    const url = `${this.baseUrl}${definitionCode}`;

    return this.http.get(url) as Observable<ClassifierItemsQuery>;
  }

  fetchClassifierItemsByDefinitionCodeWithParameters<T>(definitionCode: ClassifierDefinitionCode, params?: {}): Observable<ClassifierItemsQuery> {
    const url = `${this.baseUrl}${definitionCode}`;
    return this.httpClient.get(url, { params: { ...params } }) as Observable<ClassifierItemsQuery>;
  }

  fetchMultipleClassifierItemsByDefinitionCodes(
    definitionCodes: ClassifierDefinitionCode[]
  ): Observable<ClassifierDefinitionCode[] | {}> {
    return forkJoin(
      definitionCodes
        .map((definitionCode) => this.fetchClassifierItemsByDefinitionCode(definitionCode).pipe(
          map((data) => ({
            key: definitionCode,
            value: data.classifierItems
          }))
        ))
    ).pipe(
      map((formattedClassifiers) => formattedClassifiers
        .reduce((acc, current) => ({ ...acc, [current.key]: current.value }), {}))
    );
  }
}
