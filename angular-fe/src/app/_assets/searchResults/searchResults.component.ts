import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SettingsService } from '@app/_services/SettingsService';
import * as moment from 'moment';
import { searchResultKeys, requiredFields } from './searchResults.helper';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'searchResults',
  templateUrl: 'searchResults.template.html',
})

export class SearchResultsComponent implements OnInit, OnDestroy{

  @Input() queryName: string = '';

  private paramsWatcher: Subscription = new Subscription();
  public queryId:string = '';
  public values: object = {};
  public limit: number = 10;
  public offset: number = 0;
  public loading: boolean = true;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private settings: SettingsService,
  ) {}

  private addRequiredFields(queryParams) {
    const tmp = { ...queryParams };
    requiredFields[this.queryName].forEach((item) => {
      if (!tmp[item]) {
        tmp[item] = '';
      }
    });
    return tmp;
  }

  private parseValues(queryParams) {
    const values = {};
    const tmpParams = this.addRequiredFields(queryParams);
    Object.keys(tmpParams).forEach((item) => {
      if (item.match(/date/gmi)) {
        tmpParams[item] = moment.utc(tmpParams[item], 'DD.MM.YYYY').unix();
      }
      if (searchResultKeys[item]) {
        if (typeof searchResultKeys[item] === 'string') {
          values[searchResultKeys[item]] = tmpParams[item];
        } else {
          values[searchResultKeys[item].key] = tmpParams[item];
          values[searchResultKeys[item].enabled] = tmpParams[item] === '' ? false : true;
        }
      } else {
        values[item] = tmpParams[item];
      }
    });

    return values;
  }

  private watchParams() {
    this.paramsWatcher = this.route.queryParams.subscribe((queryParams) => {
      const values = this.parseValues({ ... queryParams });
      this.getData({ ... values });
    });
  }

  private getData(values): void {
    values.lang = 'ET';
    values.offset = this.offset;
    values.limit = this.limit;

    let query = `queryName=${this.queryName}`;
    query = `${query}&queryId=${this.queryId}`;
    query = `${query}&variables=${JSON.stringify(values)}`;

    const path = `${this.settings.url}/graphql?${query}`.trim();

    console.log(path);
    this.http.get(path).subscribe((response) => {
      console.log(response);
    });
  }

  ngOnInit() {
    this.queryId = this.settings.get(`request.${this.queryName}`);
    this.watchParams();
    console.log(this.queryName);

  }

  ngOnDestroy() {
    this.paramsWatcher.unsubscribe();
  }
}
