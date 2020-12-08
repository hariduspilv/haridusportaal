import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MainProfessionApiService } from './main-profession-api.service';
import { OskaMainProfessionListParameters } from './main-profession.model';

@Injectable({
  providedIn: 'root',
})
export class MainProfessionService {

  constructor(private formBuilder: FormBuilder, private api: MainProfessionApiService) { }

  getOskaMainProfessionsFilterForm(
    filterValues: OskaMainProfessionListParameters): FormGroup {
    return this.formBuilder.group({
      title: [''],
      oskaField: [],
    });
  }

  getOskaMainProfessionsFilter(filterParameters): Observable<any> {
    return this.api.getOskaMainProfessionsListFilter(filterParameters).pipe(map((filters) => {
      const oskaFields = filters.data.oskaFields.entities.map(oskaField => ({
        value: oskaField.nid,
        key: oskaField.title,
      }));
      return { oskaFields };
    }));
  }

  getOskaGoogleAnalyticsObject() {
    return {
      category: 'mainProfessionSearch',
      action: 'submit',
      label: 'title',
    };
  }
}
