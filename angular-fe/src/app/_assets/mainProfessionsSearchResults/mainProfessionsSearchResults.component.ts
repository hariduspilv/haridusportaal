import {
  Component,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { SettingsService, ScrollRestorationService, ListRestorationType } from '@app/_services';
import {
  searchResultKeys,
  requiredFields,
  likeFields,
  defaultValues,
  multiSelectFields,
} from './mainProfessionsSearchResults.helper';
import { HttpClient } from '@angular/common/http';
import { DeviceDetectorService } from 'ngx-device-detector';
import { paramsExist, scrollElementIntoView } from '@app/_core/utility';

@Component({
  selector: 'mainProfessionsSearchResults',
  templateUrl: 'mainProfessionsSearchResults.component.html',
  styleUrls: ['mainProfessionsSearchResults.component.scss'],
})

export class MainProfessionsSearchResultsComponent implements OnDestroy {
  @Input() limit: number = 10;
  @Input() filteredJob: Object;
  @Output() listEmitter = new EventEmitter<Object>(null);

  public type: string = 'mainProfession';
  public parsedType: string = 'mainprofession';
  public queryName: string = 'oskaMainProfessionListView';
  public queryId:string = '';
  public activeTypeFilters: any[];

  public listLimit = 1000;
  public listOffset = 0;
  public manualLimit: number = 0;

  private paramsWatcher: Subscription = new Subscription();
  private httpWatcher: Subscription = new Subscription();

  public values: object = {};
  public loading: boolean = true;
  public list: any = [];
  public filteredList: any = [];
  private getDataDebounce;
  private debounceDelay: number = 300;
  public canLoadMore: boolean = true;
  public loadingMore: boolean = false;
  public noResultStringByType: string = 'news.no_results';
  private scrollRestorationValues: { [type: string]: ListRestorationType } = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private settings: SettingsService,
    private scrollRestoration: ScrollRestorationService,
    private deviceService: DeviceDetectorService,
  ) {}

  private dispatchListEmit(update: boolean, list: Object, highlight?: any, activeFilters?: any) {
    this.listEmitter.emit({ update, list, highlight, activeFilters });
  }
  private addRequiredFields(queryParams) {
    requiredFields.forEach((item) => {
      if (!queryParams[item] && queryParams[item] !== 0) {
        queryParams[item] = '';
      }
    });
    return queryParams;
  }

  private getValue(value, key) {
    let tmpValue = value;
    tmpValue = likeFields.indexOf(key) !== -1 ? `%25${value}%25` : value;
    return tmpValue;
  }

  public filterListByTypes(typeFilters: any[]): void {
    if (typeFilters[0].active && typeFilters[1].active) {
      this.filteredList = this.list;
    } else if (typeFilters[0].active && !typeFilters[1].active) {
      this.filteredList = this.list.filter(elem => !elem.fieldProfession);
    } else if (!typeFilters[0].active && typeFilters[1].active) {
      this.filteredList = this.list.filter(elem => elem.fieldProfession);
    }
    this.activeTypeFilters = typeFilters;
    this.canLoadMore = !!(this.filteredList.length >= this.manualLimit);
  }

  private parseValues(queryParams) {
    const values = {};
    const tmpParams = this.addRequiredFields(queryParams);

    if (tmpParams.sort) {
      if (tmpParams.sort.indexOf('_') === -1) {
        tmpParams['sortField'] = tmpParams.sort;
        tmpParams['sortDirection'] = 'ASC';
      } else {
        const splitValues = tmpParams.sort.split('_');
        tmpParams['sortField'] = splitValues.splice(0, splitValues.length - 1).join('_');
        tmpParams['sortDirection'] = splitValues[splitValues.length - 1].toUpperCase();
        delete tmpParams['sort'];
      }
    }

    Object.keys(tmpParams).forEach((item) => {
      let tmpItem;
      if (searchResultKeys[item]) {
        tmpItem = searchResultKeys[item].key;
        values[searchResultKeys[item].key] =
        this.getValue(tmpParams[item], item).replace(/\;/igm, ',');
        if (Array.isArray(tmpParams[item])) {
          values[searchResultKeys[item].enabled] =
          tmpParams[item] ? false : true;
        } else {
          values[searchResultKeys[item].enabled] =
          tmpParams[item] === '' ? false : true;
        }
      } else {
        values[item] = this.getValue(tmpParams[item], item);
      }
      if (values[item] === '') {
        values[item] = (defaultValues[item] || defaultValues[item] === 0)
          ? defaultValues[item] : '';
      }

      if (multiSelectFields.indexOf(tmpItem) !== -1) {
        values[tmpItem] = values[tmpItem].split(',');
        if (values[tmpItem][0] === '') {
          values[tmpItem].splice(0, 1);
        }
      }

    });
    return values;
  }

  private watchParams() {
    this.paramsWatcher = this.route.queryParams.subscribe((queryParams) => {
      const paramsValues = this.parseValues({ ... queryParams });
      const scrollSub = this.scrollRestoration.restorationValues.subscribe((values) => {
        this.scrollRestorationValues = values;
        if (this.scrollRestoration.popstateNavigation && values && values[this.type]) {
          this.getData({ ...values[this.type].values }, false,
                       values[this.type].list, values[this.type].fullList);
        } else if (!this.scrollRestoration.popstateNavigation && values && values[this.type]) {
          this.scrollRestoration.restorationValues.next({ ...values, [this.type]: null });
          this.getData({ ... paramsValues });
        } else {
          this.getData({ ... paramsValues });
        }
      });
      scrollSub.unsubscribe();
    });
  }

  private getData(values, append?: boolean, listValue?: Object[], fullList?: Object[]): void {
    clearTimeout(this.getDataDebounce);
    this.httpWatcher.unsubscribe();
    this.getDataDebounce = setTimeout(
      () => {
        let query = `queryName=${this.queryName}`;
        query = `${query}&queryId=${this.queryId}`;
        query = `${query}&variables=${JSON.stringify(values)}`;
        const path = `${this.settings.url}/graphql?${query}`.trim();

        this.loading = true;

        if (listValue) {
          this.filteredList = listValue;
          this.list = fullList;
        } else if (!append) {
          this.list = [];
          this.filteredList = [];
        }

        if (listValue) {
          this.loading = false;
          this.manualLimit = this.scrollRestorationValues[this.type].manualLimit;
          this.canLoadMore = this.scrollRestorationValues[this.type].canLoadMore;
          const scrollSub = this.scrollRestoration.restorationPosition.subscribe((position) => {
            if (position) {
              setTimeout(() => {
                document.querySelector('.app-content').scrollTop = position[this.type];
              },         0);
            }
          });
          this.dispatchListEmit(true,
                                this.list,
                                this.scrollRestorationValues[this.type].highlight,
                                this.scrollRestorationValues[this.type].activeFilters);
          scrollSub.unsubscribe();
        } else {
          this.httpWatcher = this.http.get(path).subscribe(
          (response) => {
            this.loading = false;
            this.list = response['data']['nodeQuery']['entities'];
            this.filteredList = this.list;
            this.canLoadMore = !!(this.filteredList.length >= this.manualLimit);
            this.dispatchListEmit(false, this.filteredList);
            this.updateRestorationValues(values);
            if (this.deviceService.isMobile() && paramsExist(this.route)) {
              scrollElementIntoView('block');
            }
          },
          (err) => {
            this.loading = false;
          });
        }
      },
      this.debounceDelay);
  }

  public loadMore(): void {
    this.manualLimit = +this.manualLimit + +this.limit;
    this.canLoadMore = !!(this.filteredList.length >= this.manualLimit);
  }

  public parseParams(): any {
    const params = this.route.snapshot.queryParams;
    return this.parseValues({ ... params });
  }

  public updateRestorationValues(values?: Object): void {
    this.scrollRestoration.restorationValues.next({
      ...this.scrollRestorationValues,
      [this.type]: {
        values,
        list: this.filteredList,
        fullList: this.list,
        canLoadMore: this.canLoadMore,
        manualLimit: this.manualLimit,
        highlight: this.filteredJob,
        activeFilters: this.activeTypeFilters,
      },
    });
  }

  ngOnInit() {
    this.queryId = this.settings.get(`request.${this.queryName}`);
    this.manualLimit = this.limit;
    this.watchParams();
  }

  ngOnDestroy() {
    this.scrollRestoration.restorationPosition.next({
      ...this.scrollRestoration.restorationPosition.getValue(),
      [this.type]: document.querySelector('.app-content')?.scrollTop || 0,
    });
    this.updateRestorationValues({ ... this.parseParams() });
    this.paramsWatcher?.unsubscribe();
    this.httpWatcher?.unsubscribe();
  }

}
