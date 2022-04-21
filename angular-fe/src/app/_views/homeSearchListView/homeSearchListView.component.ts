import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '@app/_services';
import { paramsExist, scrollElementIntoView } from '@app/_core/utility';
import { DeviceDetectorService } from 'ngx-device-detector';
@Component({
  selector: 'homeSearchList-view',
  templateUrl: './homeSearchListView.template.html',
  styleUrls: ['./homeSearchListView.styles.scss'],
})

export class HomeSearchListViewComponent {
  @ViewChild('content') content: ElementRef;

  public results: any = false;
  public filteredResults: any = false;
  public dataSubscription: Subscription;
  public paramSubscription: Subscription;
  public suggestionSubscription: Subscription;
  public breadcrumbs: any = false;
  public path: any;
  public lang = this.settings.currentAppLanguage;
  public param: string = '';
  public loading: boolean = true;
  public allFilters: boolean = true;
  public viewChecked: boolean = false;
  public listLimit: number = 24;
  public listStep: number = 24;
  public listLength: number;
  public initialCrumbs: any = {
    et: [{ title: 'Avaleht', link: '/' }],
  };
  public typesByLang: any = {
    et: [
      { name: 'article.label', sumLabel: 'article', value: false, sum: 0 },
      { name: 'news.label', sumLabel: 'news', value: false, sum: 0 },
      { name: 'event.label', sumLabel: 'event', value: false, sum: 0 },
      { name: 'school.label', sumLabel: 'school', value: false, sum: 0 },
      { name: 'studyProgramme.label', sumLabel: 'study_programme', value: false, sum: 0 },
      { name: 'oska.future_job_opportunities', sumLabel: 'Oska', value: false, sum: 0 },
    ],
  };

  public oskaTypes: Array<string> = ['oska_survey_page', 'oska_main_profession_page', 'oska_field_page'];

  public types: Array<any>;
  public typeArr: any = [];

  public suggestionList: any = false;
  public debouncer: any;
  public autocompleteLoader: boolean = false;
  public scrollPositionSet: boolean = false;

  constructor (
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private settings: SettingsService,
    private deviceService: DeviceDetectorService,
  ) {}

  ngOnInit() {
    this.paramSubscription = this.route.queryParams.subscribe((params) => {
      this.types = this.typesByLang[this.lang];

      if (this.route.snapshot.queryParams['term'] !== this.param && this.param.length) {
        const queryTypes = this.route.snapshot.queryParams['type'];

        if (queryTypes && queryTypes instanceof Array) {
          this.typeArr = queryTypes;
        } else if (queryTypes) {
          this.typeArr.push(queryTypes);
        }

        this.getResults(this.route.snapshot.queryParams['term'], this.typeArr);
      }
    });

    if (this.route.snapshot.queryParams['term'] && !this.filteredResults) {
      const queryTypes = this.route.snapshot.queryParams['type'];

      if (queryTypes && queryTypes instanceof Array) {
        this.typeArr = queryTypes;
      } else if (queryTypes) {
        this.typeArr.push(queryTypes);
      }

      this.getResults(this.route.snapshot.queryParams['term'], this.typeArr);
    } else {
      this.loading = false;
    }

    this.breadcrumbs = this.constructCrumbs();
  }

  // temporary fix
  updateParam(e) {
    this.param = e.target.value;
  }

  getContentLabel(contentType: string): string {
    return contentType.includes('oska') ? 'oska.future_job_opportunities' : `${contentType}.label`;
  }

  getGoogleAnalyticsObject() {
    return {
      category: 'homeSearch',
      action: 'submit',
      label: this.param,
    };
  }

  getResults(term, type) {
    if (this.dataSubscription !== undefined) {
      this.dataSubscription.unsubscribe();
    }

    this.typeArr = type;
    this.filteredResults = false;
    this.results = false;
    this.loading = true;
    this.listLimit = this.listStep;
    this.param = term;
    this.updateParams('term', term);

    const variables = {
      lang: this.lang.toUpperCase(),
      search_term: term,
    };

    const path = this.settings.query('homeSearch', variables);

    this.dataSubscription = this.http.get(path).subscribe((data) => {
      this.updateParams('type', type.length ? type : null);
      this.results = this.filteredResults = data['data']['CustomElasticQuery'][0]['entities'];

      this.types.forEach((type) => {
        type.sum = 0; type.value = this.typeArr.includes(type.sumLabel);
      });

      this.filteredResults.forEach((res) => {
        this.types.forEach((type) => {
          if (type.sumLabel === 'Oska' &&
            this.oskaTypes.includes(res.ContentType)
          ) {
            type.sum += 1;
          }
          if (type.sumLabel === res.ContentType) {
            type.sum += 1;
          }
        });
      });

      this.filteredResults = this.results.filter((res) => {
        return this.typeArr.includes(res.ContentType) ||
        (this.typeArr.includes('Oska') && this.oskaTypes.includes(res.ContentType));
      });

      this.filteredResults = !this.typeArr.length ? this.results : this.filteredResults;

      this.types.sort((a, b) => b.sum - a.sum);
      this.allFilters = this.checkForAllFilters();
      this.breadcrumbs = this.constructCrumbs();
      this.listLength = this.filteredResults.length;
      this.loading = false;

      if (this.deviceService.isMobile() && paramsExist(this.route)) {
        scrollElementIntoView('block');
      }

      this.dataSubscription.unsubscribe();
    });
  }

  loadMore() {
    const { listLimit, listLength, listStep } = this;
    const newFocusIndex = listLimit;
    this.listLimit = listLimit + listStep < listLength ? listLimit + listStep : listLength;
    this.setFocus(newFocusIndex);
  }

  ngAfterViewChecked() {
    if (this.filteredResults && !this.viewChecked && document.getElementById('initial')) {
      document.getElementById('initial').focus();
      this.viewChecked = true;
    }
    if (!this.scrollPositionSet &&
      this.content &&
      this.content.nativeElement.offsetParent != null
    ) {
      this.scrollPositionSet = true;
    }
  }

  ngOnDestroy() {
    this.paramSubscription.unsubscribe();
  }

  setFocus(id) {
    const focusTarget = (id - 1).toString();
    document.getElementById(focusTarget).focus();
  }

  updateParams(toUpdate, param) {
    const queryParams = Object.assign({}, this.route.snapshot.queryParams);
    queryParams[toUpdate] = param;
    this.router.navigate([], { queryParams, replaceUrl: true });
  }

  constructCrumbs() {
    const lang = this.lang;
    const crumbs = this.initialCrumbs[lang];
    let crumbText;
    let crumbUrl;
    if (this.route.snapshot.queryParams['term']) {
      crumbText = `Otsingu "${this.route.snapshot.queryParams['term']}" tulemused`;
      crumbUrl = `/otsing?term=${this.route.snapshot.queryParams['term']}`;
    } else {
      crumbText = 'Otsing';
      crumbUrl = '/otsing';
    }
    return [...crumbs, { title: crumbText }];
  }

  checkForAllFilters() {
    return this.types.filter((type) => {
      return type.value || !type.sum;
    }).length === 6 || this.types.filter(type => !type.value).length === 6;
  }

  filterAll() {
    this.typeArr = [];
    this.types.forEach(type => type.value = false);
    this.filteredResults = this.results;
    this.updateParams('type', null);
    this.listLength = this.filteredResults.length;
    this.allFilters = true;
  }

  filterView(id) {
    this.types[id].value = !this.types[id].value;
    this.typeArr = [];
    this.types.forEach((type) => {
      if (type.value) { this.typeArr.push(type.sumLabel); }
    });
    this.typeArr = !this.typeArr.length ? [] : this.typeArr;
    this.filteredResults = this.results.filter((res) => {
      return this.typeArr.includes(res.ContentType) ||
        (this.typeArr.includes('Oska') &&
        this.oskaTypes.includes(res.ContentType));
    });
    this.filteredResults = !this.typeArr.length ? this.results : this.filteredResults;
    this.updateParams('type', this.typeArr.length ? this.typeArr : null);
    this.listLength = this.filteredResults.length;
    this.allFilters = this.checkForAllFilters();
  }

  populateSuggestionList(searchText, debounceTime) {
    if (searchText.length < 3) {
      clearTimeout(this.debouncer);
      this.suggestionList = [];
      return;
    }
    if (this.debouncer) clearTimeout(this.debouncer);
    if (this.suggestionSubscription !== undefined) {
      this.suggestionSubscription.unsubscribe();
    }
    this.debouncer = setTimeout((_) => {
      this.autocompleteLoader = true;

      const variables = {
        search_term: searchText,
      };
      this.suggestionSubscription = this.http.get('testAutocomplete', { params:variables })
      .subscribe((res) => {
        this.autocompleteLoader = false;
        this.suggestionList = res['data']['CustomElasticAutocompleteQuery'] || [];
        this.suggestionSubscription.unsubscribe();
      });

    },                          debounceTime);
  }

}
