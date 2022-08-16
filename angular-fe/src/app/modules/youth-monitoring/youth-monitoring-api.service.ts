import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from '@app/_services';
import { Observable, of } from 'rxjs';

@Injectable()
export class YouthMonitoringApiService {
  constructor(
    private settings: SettingsService,
    private http: HttpClient,
  ) {
  }

  public getList(): Observable<any[]> {
    return of([{
      "nid": 0,
      "title": "staatiline objekt",
      "entityUrl": {
          "routed": true,
          "path": "/noorteseire/0"
      },
      "fieldOskaFieldPicture": null,
      "fieldOskaVideo": null,
      "fieldIntroduction": "test",
      "reverseFieldOskaFieldParagraph": {
          "entities": []
      },
      "__typename": "NodeOskaFieldPage"
    }]);
  }
}
