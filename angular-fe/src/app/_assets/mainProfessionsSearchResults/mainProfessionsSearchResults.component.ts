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
import FieldVaryService from '@app/_services/FieldVaryService';
import { take } from 'rxjs/operators';

@Component({
  selector: 'mainProfessionsSearchResults',
  templateUrl: 'mainProfessionsSearchResults.component.html',
  styleUrls: ['mainProfessionsSearchResults.component.scss'],
})

export class MainProfessionsSearchResultsComponent implements OnDestroy {
  @Input() limit: number = 10;
  @Output() listEmitter = new EventEmitter<Object>(null);
  @Output() filterEmitter = new EventEmitter<Object>(null);

  public highlighted?: any;

  public type: string = 'mainProfession';
  public parsedType: string = 'mainprofession';
  public queryName: string = 'oskaMainProfessionListView';
  public queryId:string = '';

  public limitStep = 24;
  public listOffset = 0;
  public listCount = 0;
  public professionCount = 0;
  public nonProfessionCount = 0;

  private paramsWatcher: Subscription = new Subscription();
  private httpWatcher: Subscription = new Subscription();

  public values: object = {};
  public loading: boolean = true;
  public loadingMore: boolean = false;
  public list: any = [];
  public filteredList: any = [];
  private getDataDebounce;
  private debounceDelay: number = 300;
  public canLoadMore: boolean = true;
  public noResultStringByType: string = 'news.no_results';
  private scrollRestorationValues: { [type: string]: ListRestorationType } = null;
  public listItemCount: number;
  public searchWithParams: boolean = false;

  competitionLabels = [
    'oska.simple_extended',
    'oska.quite_simple_extended',
    'oska.medium_extended',
    'oska.quite_difficult_extended',
    'oska.difficult_extended',
  ];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private settings: SettingsService,
    private scrollRestoration: ScrollRestorationService,
    private deviceService: DeviceDetectorService,
  ) {}

  private dispatchListEmit(update: boolean, list: Object) {
    this.listEmitter.emit({
      update,
      list,
      listCount: this.listCount,
      nonProfessionCount: this.nonProfessionCount,
      professionCount: this.professionCount,
    });
  }

  private dispatchFilterEmit(queryParams: Record<string, string>): void {
    this.filterEmitter.emit({
      queryParams,
    });
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
    } else if (tmpParams['sortField'] || tmpParams['sortDirection']) {
      tmpParams['sortDirection'] = '';
      tmpParams['sortField'] = '';
    }

    if (tmpParams.fieldProfession != '') {
      if (tmpParams.fieldProfession === 'true') {
        tmpParams.fieldProfession = '1';
      } else {
        tmpParams.fieldProfession = '0';
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
      this.dispatchFilterEmit(queryParams);
      this.listOffset = 0;
      const scrollSub = this.scrollRestoration.restorationValues.subscribe((values) => {
        this.scrollRestorationValues = values;
        if (this.scrollRestoration.popstateNavigation && values && values[this.type]) {
          this.getData({ ...values[this.type].values }, false,
                       values[this.type].list);
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

  private getData(values, append?: boolean, listValue?: Object[]): void {
    clearTimeout(this.getDataDebounce);
    this.httpWatcher.unsubscribe();
    this.getDataDebounce = setTimeout(
      () => {
        values.offset = this.listOffset;
        values.lang = this.settings.currentAppLanguage;
        let query = `queryName=${this.queryName}`;
        query = `${query}&queryId=${this.queryId}`;
        query = `${query}&variables=${JSON.stringify(values)}`;
        const path = `${this.settings.url}/graphql?${query}`.trim();

        if (!this.loadingMore) {
          this.loading = true;
        }

        if (listValue) {
          this.list = listValue;
        } else if (!append) {
          this.list = [];
        }

        this.searchWithParams = !!Object.values(this.route.snapshot.queryParams)
          .filter(val => val)?.length;
        if (listValue) {
          this.loading = false;
          this.loadingMore = false;
          this.listCount = this.scrollRestorationValues[this.type].listItemCount;
          this.nonProfessionCount = this.scrollRestorationValues[this.type].nonProfessionCount;
          this.professionCount = this.scrollRestorationValues[this.type].professionCount;
          this.listCount = this.scrollRestorationValues[this.type].listItemCount;
          this.canLoadMore = this.scrollRestorationValues[this.type].canLoadMore;
          this.highlighted = this.scrollRestorationValues[this.type].highlight;
          const scrollSub = this.scrollRestoration.restorationPosition.subscribe((position) => {
            if (position) {
              setTimeout(() => {
                document.querySelector('.app-content').scrollTop = position[this.type];
              },         0);
            }
          });
          this.dispatchListEmit(true, this.list);
          scrollSub.unsubscribe();
        } else {
          this.httpWatcher = this.http.get(path).subscribe({
            next: (response) => {
              if (response['data']['countProfessionsFalseValue']) {
                this.nonProfessionCount = response['data']['countProfessionsFalseValue']['count'];
                this.professionCount = response['data']['countProfessionsValue']['count'];
              }
              this.listCount = response['data']['nodeQuery']['count'];
              const listData = response['data']['nodeQuery']['entities'];
              if (append) {
                this.list = [...this.list, ...listData];
                this.loading = false;
                this.loadingMore = false;
              } else {
                this.list = listData;
                this.selectArbitraryHighlightedJob();
              }

              this.canLoadMore = !!(this.listCount > this.list.length);
              this.dispatchListEmit(false, this.list);
              this.updateRestorationValues(values);
              if (this.deviceService.isMobile() && paramsExist(this.route)) {
                scrollElementIntoView('block:not([theme="transparent"])');
              }
            },
            error: (err) => {
              this.loading = false;
              this.loadingMore = false;
            }
          });
        }
      },
      this.debounceDelay);
  }

  public loadMore(): void {
    this.loadingMore = true;
    this.listOffset = this.list.length;
    const params = this.route.snapshot.queryParams;
    const values = this.parseValues({ ... params });
    this.getData({ ... values }, true);
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
        list: this.list,
        canLoadMore: this.canLoadMore,
        listItemCount: this.listCount,
        nonProfessionCount: this.nonProfessionCount,
        professionCount: this.professionCount,
        highlight: this.highlighted,
      },
    });
  }

  public selectArbitraryHighlightedJob(): void {
    if (this.list && this.list.length && !this.searchWithParams) {
      // If there already was a selected highlight, check to see if its in the resulting list
      if (this.highlighted) {
        const exists = this.list.findIndex(
          (elem: any) => elem.nid === this.highlighted.nid,
        );
        if (exists > -1) {
          // If it is, remove it from the list and put it in front
          this.list.splice(exists, 1);
          this.list.unshift(this.highlighted);
          this.loading = false;
          this.loadingMore = false;
          return;
        }
      }

      const filteredList: Object[] = this.list.filter(elem =>
        elem.fieldFillingBar === 1 || elem.fieldFillingBar === 2);
      if (filteredList.length) {
        const filteredItem: number = Math.floor(Math.random() * filteredList.length);
        const initialFilteredJob = filteredList[filteredItem];
        const initialFilteredJobPath = initialFilteredJob['entityUrl'] ? initialFilteredJob['entityUrl']['path']
            : initialFilteredJob['url']['path'];
        // Remove selected from the list
        this.list.splice(this.list.indexOf(initialFilteredJob), 1);
        // TODO: GET RID OF THIS NIGHTMARE PLEASE!!!
        // I need to create a request to get the pictogram field..
        const jobSubscription = this.http.get(
          this.settings.query('oskaMainProfessionDetailView', { path: initialFilteredJobPath }))
          .pipe(take(1))
          .subscribe({
            next: (response) => {
              const filteredJob = FieldVaryService(initialFilteredJob);
              filteredJob['highlighted'] = true;
              if (!filteredJob['fixedLabel']) {
                filteredJob['fixedLabel'] = {
                  entity: {
                    entityLabel: this.competitionLabels[filteredJob['fieldFillingBar'] - 1],
                  },
                };
              }
              filteredJob['fieldPictogram'] = response['data']['route']['entity']['fieldPictogram'];
              this.highlighted = filteredJob;
              this.list.unshift(filteredJob);
              jobSubscription.unsubscribe();
              this.loading = false;
              this.loadingMore = false;
            },
            error: () => {
              this.loading = false;
              this.loadingMore = false;
            }
          });
        return;
      }
    }

    this.loading = false;
    this.loadingMore = false;
  }

  ngOnInit() {
    this.queryId = this.settings.get(`request.${this.queryName}`);
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
