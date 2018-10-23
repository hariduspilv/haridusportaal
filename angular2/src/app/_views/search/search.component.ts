import { Component } from '@angular/core';
import { RootScopeService } from '@app/_services';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '@app/_services/httpService';
import { Subscription } from 'rxjs/Subscription';
@Component({
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})

export class SearchComponent {
  
  results: any = false;
  filteredResults: any = false;
  dataSubscription: Subscription;
  paramSubscription: Subscription;
  breadcrumbs: any = false;
  path: any;
  lang: any;
  param: string = '';
  loading: boolean = true;
  allFilters: boolean = true;
  viewChecked: boolean = false;
  listLimit: number = 5;
  listStep: number = 5;
  listLength: number;
  initialCrumbs: any = {
    'en': [{"text": "Home", "url": "/en"}],
    'et': [{"text": "Avaleht", "url": "/et"}]
  };
  typesByLang: any = {
    et: [
      {"name": "article.label", "sumLabel": "Artikkel", "value": false, "sum": 0},
      {"name": "news.label", "sumLabel": "Uudis", "value": false, "sum": 0},
      {"name": "event.label", "sumLabel": "Sündmus", "value": false, "sum": 0},
      {"name": "school.label", "sumLabel": "Kool", "value": false, "sum": 0},
      {"name": "studyProgramme.label", "sumLabel": "Õppekava", "value": false, "sum": 0},
      {"name": "oskaProfessions.label", "sumLabel": "Sisuleht OSKA Ametiala", "value": false, "sum": 0},
      {"name": "oska.workforcePrognosis", "sumLabel": "Sisuleht OSKA Tööjõuprognoos", "value": false, "sum": 0},
      {"name": "oska.title_field", "sumLabel": "Sisuleht OSKA Valdkond", "value": false, "sum": 0}
    ],
    en: [
      {"name": "article.label", "sumLabel": "Article", "value": false, "sum": 0},
      {"name": "news.label", "sumLabel": "News", "value": false, "sum": 0},
      {"name": "event.label", "sumLabel": "Event", "value": false, "sum": 0},
      {"name": "school.label", "sumLabel": "Kool", "value": false, "sum": 0},
      {"name": "studyProgramme.label", "sumLabel": "Õppekava", "value": false, "sum": 0},
      {"name": "oskaProfessions.label", "sumLabel": "Sisuleht OSKA Ametiala", "value": false, "sum": 0},
      {"name": "oska.workforcePrognosis", "sumLabel": "Sisuleht OSKA Tööjõuprognoos", "value": false, "sum": 0},
      {"name": "oska.title_field", "sumLabel": "Sisuleht OSKA Valdkond", "value": false, "sum": 0}
    ]
  };
  types: Array<any>;
  typeArr: any = [];
  
  constructor (
    private rootScope:RootScopeService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpService
  ) {}

  ngOnInit() {

    this.paramSubscription = this.route.queryParams.subscribe( params => {
      this.lang = this.route.snapshot.params['lang'];
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

    this.rootScope.set('langOptions', {
      'en': '/en/search',
      'et': '/et/otsing',
    });

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
    let url = "http://test-htm.wiseman.ee:30000/graphql?queryId=homeSearch:1&variables=";
    if (window.location.host === ('test.edu.ee')) {
      url = "https://api.test.edu.ee/graphql?queryId=homeSearch:1&variables=";
    }

    let variables = {
      lang: this.rootScope.get('currentLang').toUpperCase(),
      search_term: term
    }
    this.dataSubscription = this.http.get(url+JSON.stringify(variables)).subscribe(data => {
      this.updateParams('type', type.length ? type : null);
      this.results = this.filteredResults = data['data']['CustomElasticQuery'];
      
      this.types.forEach(type => {type.sum = 0;type.value = this.typeArr.includes(type.sumLabel)});
      
      this.filteredResults.forEach(res => {
        this.types.forEach(type => {
          if(type.sumLabel === res.ContentType) {type.sum += 1;}
        });
      });
      this.filteredResults = this.results.filter(res => this.typeArr.includes(res.ContentType));
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
    this.router.navigate([], { queryParams: queryParams });
  }

  constructCrumbs() {
    let lang = this.rootScope.get('currentLang');
    let crumbs = this.initialCrumbs[lang];
    if (this.route.snapshot.queryParams['term']) {
      var crumbText = lang === 'et' ? `Otsingu "${this.route.snapshot.queryParams['term']}" tulemused`
        : `Keyword "${this.route.snapshot.queryParams['term']}" results`;
      var crumbUrl = lang === 'et' ? `/${lang}/otsing?term=${this.route.snapshot.queryParams['term']}`
        : `/${lang}/search?term=${this.route.snapshot.queryParams['term']}`;
    } else {
      var crumbText = lang === 'et' ? 'Otsing' : 'Search'
      var crumbUrl = lang === 'et' ? `/${lang}/otsing` : `/${lang}/search`;
    }
    return [...crumbs, {text: crumbText, url: crumbUrl}];
  }

  checkForAllFilters() {
    return this.types.filter((type) => type.value || !type.sum).length === 8 || this.types.filter((type) => !type.value).length === 8;
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
      if (type.value) {this.typeArr.push(type.sumLabel)}
    });
    this.typeArr = !this.typeArr.length ? [] : this.typeArr;
    this.filteredResults = this.results.filter(res => this.typeArr.includes(res.ContentType));
    this.filteredResults = !this.typeArr.length ? this.results : this.filteredResults;
    this.updateParams('type', this.typeArr.length ? this.typeArr : null);
    this.listLength = this.filteredResults.length;
    this.allFilters = this.checkForAllFilters();
  }

}
