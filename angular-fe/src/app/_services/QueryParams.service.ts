import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Injectable()
export class QueryParamsService {
  constructor(
    private route: ActivatedRoute,
  ) {}

  /**
   * Get query parameter values
   * @param [key] - query param key
   * @param [type] - obsolete
   * @returns - query param value OR full array of queryParams with values when key is empty
   */
  public getValues(key: string = undefined, type: string = '') {
    const tmpParams = { ... this.route.snapshot.queryParams } || {};
    Object.keys(tmpParams).forEach((item) => {
      if (tmpParams[item].match(';')) {
        tmpParams[item] = tmpParams[item].split(';');
        tmpParams[item] = tmpParams[item].map((obj) => {
          let val = obj;
          if (!obj.match(/\D/)) {
            val = parseFloat(val);
          }
          return `${val}`;
        });
      }
    });

    return key ? tmpParams[key] : tmpParams;
  }
}
