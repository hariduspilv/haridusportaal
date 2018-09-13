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
  breadcrumbs: any = false;
  path: any;
  lang: any;
  param: string = '';
  loading: boolean = true;
  listLimit: number = 5;
  listStep: number = 5;
  listLength: number;
  initialCrumbs = {
    'en': [{"text": "Home", "url": "/en"}],
    'et': [{"text": "Avaleht", "url": "/et"}]
  };
  types = [
    {"name": "article.label", "sumLabel": "Artikkel", "value": false, "sum": 0},
    {"name": "news.label", "sumLabel": "Uudis", "value": false, "sum": 0},
    {"name": "event.label", "sumLabel": "Sündmus", "value": false, "sum": 0},
    {"name": "school.label", "sumLabel": "Kool", "value": false, "sum": 0},
    {"name": "studyProgramme.label", "sumLabel": "Õppekava", "value": false, "sum": 0},
  ];
  // sums = {"Artikkel": 0, "Kool": 0, "Sündmus": 0, "Uudis": 0, "Õppekava": 0};
    
  
  constructor (
    private rootScope:RootScopeService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpService
  ) {}

  ngOnInit() {
    if( this.route.snapshot.queryParams['term'] ){
      this.getResults(this.route.snapshot.queryParams['term'])
      this.param = this.route.snapshot.queryParams['term'] 
    } else {
      this.loading = false;
    }
    this.rootScope.set('langOptions', {
      'en': '/en/search',
      'et': '/et/otsing',
    });
    this.breadcrumbs = this.constructCrumbs();
  }

  getResults(term) {
    if( this.dataSubscription !== undefined ){
      this.dataSubscription.unsubscribe();
    }
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
      this.results = this.filteredResults = data['data']['CustomElasticQuery'];
      
      this.types.forEach(type => {type.sum = 0;type.value = false});
      this.filteredResults.forEach(res => {
        this.types.forEach(type => {
          if(type.sumLabel === res.ContentType) {type.sum += 1;}
        });
      });
      this.types.sort((a, b) => b.sum - a.sum)
      
      this.breadcrumbs = this.constructCrumbs()
      this.listLength = this.filteredResults.length;
      this.loading = false;
      this.dataSubscription.unsubscribe();
    });
  }

  loadMore() {
    const {listLimit, listLength, listStep} = this;
    let newFocusIndex = listLimit;
    this.listLimit = listLimit + listStep < listLength ? listLimit + listStep : listLength;
    // this.setFocus(`result_${newFocusIndex}`)
  }

  // ngAfterViewInit() {
  //   this.setFocus('result_0')
  // }  
  // setFocus(id) {)
  //   document.getElementById(id).focus()
  // }
  
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

  filterView(id) {
    this.types[id].value = !this.types[id].value;
    var typeArr = [];
    this.types.forEach((type) => {
      if (type.value) {typeArr.push(type.sumLabel)}
    });
    typeArr = !typeArr.length ? ["Artikkel", "Kool", "Sündmus", "Uudis", "Õppekava"] : typeArr;
    this.filteredResults = this.results.filter(res => typeArr.includes(res.ContentType));
    this.listLength = this.filteredResults.length;
  }

}
