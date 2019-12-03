import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Injectable()
export class QueryParamsService {
  constructor(
    private route: ActivatedRoute,
  ) {}

  public getValues(key: string = undefined) {
    const tmpParams = { ... this.route.snapshot.queryParams } || {};
    Object.keys(tmpParams).forEach((item) => {
      if (tmpParams[item].match(';')) {
        tmpParams[item] = tmpParams[item].split(';');
        tmpParams[item] = tmpParams[item].map((obj) => {
          let val = obj;
          if (!obj.match(/\D/)) {
            val = parseFloat(val);
          }
          return val;
        });
      }
    });

    return key ? tmpParams[key] : tmpParams;
  }
}
