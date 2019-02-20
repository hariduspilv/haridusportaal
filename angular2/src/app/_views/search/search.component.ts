import { Component } from '@angular/core';
import { RootScopeService } from '@app/_services';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '@app/_services/httpService';
import { Subscription } from 'rxjs/Subscription';
import { SettingsService } from '@app/_services/settings.service';
@Component({
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})

export class SearchComponent {
  
  public results: any = false;
  public filteredResults: any = false;
  public dataSubscription: Subscription;
  public paramSubscription: Subscription;
  public suggestionSubscription: Subscription;
  public breadcrumbs: any = false;
  public path: any;
  public lang: any;
  public param: string = '';
  public loading: boolean = true;
  public allFilters: boolean = true;
  public viewChecked: boolean = false;
  public listLimit: number = 5;
  public listStep: number = 5;
  public listLength: number;
  public initialCrumbs: any = {
    'et': [{"text": "Avaleht", "url": "/"}]
  };
  public typesByLang: any = {
    et: [
      {"name": "article.label", "sumLabel": "Sisuleht Artikkel", "value": false, "sum": 0},
      {"name": "news.label", "sumLabel": "Uudis", "value": false, "sum": 0},
      {"name": "event.label", "sumLabel": "Sündmus", "value": false, "sum": 0},
      {"name": "school.label", "sumLabel": "Kool", "value": false, "sum": 0},
      {"name": "studyProgramme.label", "sumLabel": "Õppekava", "value": false, "sum": 0},
      {"name": "oska.future_job_opportunities", "sumLabel": "Oska", "value": false, "sum": 0}
    ]
  };
  public oskaTypes: Array<string> = ['Sisuleht OSKA Ametiala','Sisuleht OSKA Tööjõuprognoos','Sisuleht OSKA Valdkond'];
  public types: Array<any>;
  public typeArr: any = [];

  public suggestionList: any = false;
  public debouncer: any;
  public autocompleteLoader: boolean = false;
  
  constructor (
    private rootScope:RootScopeService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpService,
    private settings: SettingsService
  ) {}

  ngOnInit() {

    this.lang = this.rootScope.get("lang");

    this.paramSubscription = this.route.queryParams.subscribe( params => {
      
      this.types = this.typesByLang[this.lang];
      if(this.route.snapshot.queryParams['term'] !== this.param && this.param.length) {
        this.param = this.route.snapshot.queryParams['term'];
        var queryTypes = this.route.snapshot.queryParams['type'];
        if (queryTypes && queryTypes instanceof Array) {
          this.typeArr = queryTypes;
        } else if (queryTypes) {
          this.typeArr.push(queryTypes);
        }
        this.getResults(this.param, this.typeArr);
      }
    });

    if (this.route.snapshot.queryParams['term']) {
      this.param = this.route.snapshot.queryParams['term'];
      var queryTypes = this.route.snapshot.queryParams['type'];
      if (queryTypes && queryTypes instanceof Array) {
        this.typeArr = queryTypes;
      } else if (queryTypes) {
        this.typeArr.push(queryTypes);
      }
      this.getResults(this.param, this.typeArr);
    } else {
      this.loading = false;
    }

    this.breadcrumbs = this.constructCrumbs();
  }

  getResults(term, type) {
    if( this.dataSubscription !== undefined ){
      this.dataSubscription.unsubscribe();
    }
    this.typeArr = type;
    this.filteredResults = false;
    this.results = false;
    this.loading = true;
    this.listLimit = this.listStep;
    this.updateParams('term', term);

    let variables = {
      lang: this.rootScope.get('lang').toUpperCase(),
      search_term: term
    }
    this.dataSubscription = this.http.get('homeSearch', {params:variables}).subscribe(data => {
      this.updateParams('type', type.length ? type : null);
      this.results = this.filteredResults = data['data']['CustomElasticQuery'];
      
      this.types.forEach(type => {type.sum = 0;type.value = this.typeArr.includes(type.sumLabel)});
      
      this.filteredResults.forEach(res => {
        this.types.forEach(type => {
          if(type.sumLabel === 'Oska' && this.oskaTypes.includes(res.ContentType)) {type.sum += 1;}
          if(type.sumLabel === res.ContentType) {type.sum += 1;}
        });
      });
      this.filteredResults = this.results.filter(res => this.typeArr.includes(res.ContentType) || (this.typeArr.includes('Oska') && this.oskaTypes.includes(res.ContentType)));
      this.filteredResults = !this.typeArr.length ? this.results : this.filteredResults;

      this.types.sort((a, b) => b.sum - a.sum)
      this.allFilters = this.checkForAllFilters();
      this.breadcrumbs = this.constructCrumbs();
      this.listLength = this.filteredResults.length;
      this.loading = false;
      this.dataSubscription.unsubscribe();
    });
  }

  loadMore() {
    const {listLimit, listLength, listStep} = this;
    let newFocusIndex = listLimit;
    this.listLimit = listLimit + listStep < listLength ? listLimit + listStep : listLength;
    this.setFocus(newFocusIndex);
  }

  ngAfterViewChecked() {
    if (this.filteredResults && !this.viewChecked && document.getElementById('initial')) {
      document.getElementById('initial').focus();
      this.viewChecked = true;
    }
  }  

  ngOnDestroy() {
    this.paramSubscription.unsubscribe();
  }

  setFocus(id) {
    let focusTarget = (id - 1).toString();
    document.getElementById(focusTarget).focus();
  }
  
  updateParams(toUpdate, param) {
    const queryParams = Object.assign({}, this.route.snapshot.queryParams);
    queryParams[toUpdate] = param;
    this.router.navigate([], { queryParams: queryParams, replaceUrl: true });
  }

  constructCrumbs() {
    let lang = this.rootScope.get('lang');
    let crumbs = this.initialCrumbs[lang];
    if (this.route.snapshot.queryParams['term']) {
      var crumbText = `Otsingu "${this.route.snapshot.queryParams['term']}" tulemused`;
      var crumbUrl = `/otsing?term=${this.route.snapshot.queryParams['term']}`;
    } else {
      var crumbText = 'Otsing';
      var crumbUrl = `/otsing`;
    }
    return [...crumbs, {text: crumbText, url: crumbUrl}];
  }

  checkForAllFilters() {
    return this.types.filter((type) => type.value || !type.sum).length === 6 || this.types.filter((type) => !type.value).length === 6;
  }
  
  // checkForSingleFilter() {
  //   return this.types.filter((type) => type.value || !type.sum).length === 1 || this.types.filter((type) => !type.value).length === 1;
  // }

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
      if (type.value) {this.typeArr.push(type.sumLabel)}
    });
    this.typeArr = !this.typeArr.length ? [] : this.typeArr;
    this.filteredResults = this.results.filter(res => this.typeArr.includes(res.ContentType) || (this.typeArr.includes('Oska') && this.oskaTypes.includes(res.ContentType)));
    this.filteredResults = !this.typeArr.length ? this.results : this.filteredResults;
    this.updateParams('type', this.typeArr.length ? this.typeArr : null);
    this.listLength = this.filteredResults.length;
    this.allFilters = this.checkForAllFilters();
  }

  populateSuggestionList(searchText, debounceTime) {
    if(searchText.length < 3) {
      clearTimeout(this.debouncer);
      this.suggestionList = [];
      return;
    }
    if(this.debouncer) clearTimeout(this.debouncer)
    if(this.suggestionSubscription !== undefined) {
      this.suggestionSubscription.unsubscribe();
    }
    this.debouncer = setTimeout(_ => {
      this.autocompleteLoader = true;

      let variables = {
        search_term: searchText
      }
      let suggestionSubscription = this.http.get('testAutocomplete', {params:variables}).subscribe(res => {
        this.autocompleteLoader = false;
        this.suggestionList = res['data']['CustomElasticAutocompleteQuery'] || [];
        this.suggestionSubscription.unsubscribe();
      });

    }, debounceTime)
  }
}
