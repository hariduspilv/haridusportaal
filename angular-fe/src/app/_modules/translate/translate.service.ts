import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '@app/_services';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TranslateService {

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
  ) {}

  error: boolean = false;
  data: Object;
  translationsLoaded$ = new BehaviorSubject<boolean>(false);

  findObj(obj, path) {
    return path
    .replace(/\[|\]\.?/g, '.')
    .split('.')
    .filter(s => s)
    .reduce((acc, val) => acc && acc[val], obj);
  }

  get(key:string = '') {
    let value = '';
    if (!this.data) {
      value = `${key}`;
    } else {
      value = this.findObj(this.data, key) || `${key}`;
    }
    return value;
  }

  load() {
    return new Promise((resolve, reject) => {

      const httpResponse = (response) => {
        /* Timeout for testing purposes. ToDO: Remove it ofc.. */
        this.data = response;
        this.translationsLoaded$.next(true);
        resolve(true);
      };

      const errorHandler = () => resolve(true);

      this.http.get(`${this.settings.url}/translations?_format=json&lang=et`).subscribe({
        next: httpResponse,
        error: errorHandler,
      });

    });
  }

}
