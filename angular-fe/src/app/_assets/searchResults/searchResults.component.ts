import {
  Component,
  OnDestroy,
  Input,
  OnChanges,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { SettingsService } from '@app/_services/SettingsService';
import * as moment from 'moment';
import {
  searchResultKeys,
  requiredFields,
  queryList,
  likeFields,
  defaultValues,
  multiSelectFields,
} from './searchResults.helper';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'searchResults',
  templateUrl: 'searchResults.template.html',
  styleUrls: ['searchResults.styles.scss'],
})

export class SearchResultsComponent implements AfterViewInit, OnDestroy, OnChanges{

  @Input() type: string = '';
  @Input() limit: number = 10;
  @Input() compare: string = '';

  public parsedType: string = '';
  public queryName: string = '';

  private paramsWatcher: Subscription = new Subscription();
  private httpWatcher: Subscription = new Subscription();
  public queryId:string = '';
  public values: object = {};
  public offset: number = 0;
  public loading: boolean = true;
  public list: any = [];
  private getDataDebounce;
  private debounceDelay: number = 300;
  public canLoadMore: boolean = true;
  public loadingMore: boolean = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private settings: SettingsService,
    private cdr: ChangeDetectorRef,
  ) {}

  private addRequiredFields(queryParams) {
    const tmp = { ...queryParams };
    requiredFields[this.parsedType].forEach((item) => {
      if (!tmp[item]) {
        if (item.match(/date/gmi)) {
          if (item.match(/min/gmi)) {
            if (this.parsedType === 'news') {
              tmp[item] = moment().utc().subtract(5, 'years').unix();
            } else {
              tmp[item] = moment().utc().startOf('D').unix();
            }
          } else if (item.match(/max/gmi)) {
            tmp[item] = moment().utc().add(1, 'years').unix();
          }
        } else {
          tmp[item] = '';
        }
      }
    });
    return tmp;
  }

  private getValue(value, key) {
    let tmpValue = value;
    try {
      tmpValue = likeFields[this.parsedType].indexOf(key) !== -1 ? `%25${value}%25` : value;
    } catch (err) {}
    return tmpValue;
  }
  private parseValues(queryParams) {
    const values = {};
    const tmpParams = this.addRequiredFields(queryParams);

    Object.keys(tmpParams).forEach((item) => {
      if (item.match(/date/gmi)) {
        if (typeof tmpParams[item] === 'string') {
          if (item.match(/min/gmi)) {
            tmpParams[item] = moment.utc(tmpParams[item], 'DD.MM.YYYY').startOf('D').unix();
          } else if (item.match(/max/gmi)) {
            tmpParams[item] = moment.utc(tmpParams[item], 'DD.MM.YYYY').endOf('D').unix();
          } else {
            tmpParams[item] = moment.utc(tmpParams[item], 'DD.MM.YYYY').unix();
          }
        } else {
          tmpParams[item] = tmpParams[item].toString();
        }
      }
      if (searchResultKeys[this.parsedType][item]) {
        if (typeof searchResultKeys[this.parsedType][item] === 'string') {
          values[searchResultKeys[this.parsedType][item]] = this.getValue(tmpParams[item], item).replace(/\;/igm, ',');
        } else {
          // tslint:disable-next-line: max-line-length
          values[searchResultKeys[this.parsedType][item].key] = this.getValue(tmpParams[item], item).replace(/\;/igm, ',');
          // tslint:disable-next-line: max-line-length
          if (Array.isArray(tmpParams[item])) {
            values[searchResultKeys[this.parsedType][item].enabled] = tmpParams[item] ? false : true;
          } else {
            values[searchResultKeys[this.parsedType][item].enabled] = tmpParams[item] === '' ? false : true;
          }
        }
      } else {
        values[item] = this.getValue(tmpParams[item], item);
      }
      if (values[item] === '') {
        try {
          values[item] = defaultValues[this.parsedType][item] || '';
        } catch (err) {}
      }

      try {
        if (multiSelectFields[this.parsedType].indexOf(item) !== -1) {
          values[item] = values[item].split(',');
          if (values[item][0] === '') {
            values[item].splice(0, 1);
          }
        }
      } catch (err) {}

    });
    
    return values;
  }

  private watchParams() {
    this.paramsWatcher = this.route.queryParams.subscribe((queryParams) => {
      const values = this.parseValues({ ... queryParams });
      this.offset = 0;
      this.getData({ ... values });
    });
  }

  private getData(values, append: boolean = false): void {
    clearTimeout(this.getDataDebounce);
    this.httpWatcher.unsubscribe();
    this.getDataDebounce = setTimeout(
      () => {
        values.lang = 'ET';
        values.offset = this.offset;
        values.limit = this.limit;

        let query = `queryName=${this.queryName}`;
        // TODO @KOKK: FIX SO WE DONT NEED THIS HACK
        if (this.queryName === 'schoolMapQuery') {
          if (values.primaryTypes) {
            values.type = values.primaryTypes.split(';');
            values.typeEnabled = true;
          }
          if (values.secondaryTypes) {
            values.type = [...values.type, ...values.secondaryTypes.split(';')];
            values.typeEnabled = true;
          }
        }
        query = `${query}&queryId=${this.queryId}`;
        query = `${query}&variables=${JSON.stringify(values)}`;

        const path = `${this.settings.url}/graphql?${query}`.trim();

        if (!this.loadingMore) {
          this.loading = true;
        }

        if (!append) {
          this.list = [];
        }

        this.httpWatcher = this.http.get(path).subscribe(
          (response) => {
            if (!this.loadingMore) {
              this.loading = false;
            }
            this.loadingMore = false;
            let tmpList:[] = [];
            try {
              if (response['data']['nodeQuery']) {
                tmpList = response['data']['nodeQuery']['entities'];
              } else if (response['data']['CustomElasticQuery']) {
                tmpList = response['data']['CustomElasticQuery'];
              }
              this.cdr.detectChanges();
            } catch (err) {
            }

            if (!tmpList) {
              tmpList = [];
            }

            this.canLoadMore = tmpList.length >= this.limit ? true : false;

            if (append) {
              this.list = [...this.list, ...tmpList];
            } else {
              this.list = tmpList;
            }
          },
          (err) => {
            this.loading = false;
            this.loadingMore = false;
          });
      },
      this.debounceDelay);
  }

  public loadMore(): void {
    this.loadingMore = true;
    this.offset = this.list.length;
    const params = this.route.snapshot.queryParams;
    const values = this.parseValues({ ... params });
    this.getData({ ... values }, true);
  }

  ngAfterViewInit() {
    setTimeout(
      () => {
        this.parsedType = this.type.toLowerCase();
        this.queryName = queryList[this.parsedType];
        this.queryId = this.settings.get(`request.${this.queryName}`);
        this.watchParams();
      },
      0);

  }

  ngOnChanges() {
    this.parsedType = this.type.toLowerCase();
    this.queryName = queryList[this.parsedType];
    this.queryId = this.settings.get(`request.${this.queryName}`);
    this.paramsWatcher.unsubscribe();
    this.httpWatcher.unsubscribe();
    this.watchParams();
  }

  ngOnDestroy() {
    this.paramsWatcher.unsubscribe();
    this.httpWatcher.unsubscribe();
  }

}
