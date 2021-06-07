import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from '@app/_services';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JobOffersDto, JobOfferSingleDto, TootukassaJobOffer } from './job-offers-map.models';

const translations = {
  fieldFullTime: 'jobOffer.full_time',
  fieldPartTime: 'jobOffer.part_time',
  fieldInShifts: 'jobOffer.with_shifts',
  fieldAtNight: 'jobOffer.at_night'
}

@Injectable()
export class JobOffersMapService {
  constructor(
    private http: HttpClient,
    private settings: SettingsService,
  ) {}

  public getMapData(): Observable<TootukassaJobOffer[]> {
    const variables = {
      lang: 'ET',
      count: 100,
    };

    const path = this.settings.query('jobOffersNodeQuery', variables);
    return this.http.get<JobOffersDto>(path)
      .pipe(map((response) => this.localFieldVary(response.data.nodeQuery.entities)));
  }

  private localFieldVary(response: JobOfferSingleDto[]): TootukassaJobOffer[] {
    return response.map((data) => ({
      FieldName: data.title,
      FieldAddress: data.fieldLocation.entity.fieldAddress,
      FieldDate: data.fieldDate,
      FieldAddressADRID: data.fieldAdrid,
      FieldOfferedBy: data.fieldInstitution,
      FieldJobTime: Object.keys(translations).reduce((accumulator, current) => [
        ...accumulator,
        (data.fieldTime.entity[current] === true) ? translations[current] : null
      ], []).filter((item) => item),
      FieldURL: data.fieldWebpageLink[0].uri,
      Lat: parseFloat(data.fieldLocation.entity.fieldLat),
      Lon: parseFloat(data.fieldLocation.entity.fieldLong)
    }));
  }
}
