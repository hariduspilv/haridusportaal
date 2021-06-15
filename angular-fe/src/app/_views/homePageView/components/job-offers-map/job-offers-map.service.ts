import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { temporaryDataChunk } from "./job-offers-map.mock";
import { TootukassaJobOffer } from "./job-offers-map.models";

@Injectable()
export class JobOffersMapService {
  constructor(private http: HttpClient) {}

  public getMapData(): Observable<TootukassaJobOffer[]> {
    //return this.http.get<TootukassaJobOffer[]>('https://www.tootukassa.ee/api/toopakkumised').pipe(
    //  map((response) => response.filter((jobOffer) => jobOffer.VALDKOND_KOOD === 'HARIDUS'))
    //);
    return of(temporaryDataChunk);
  }
}