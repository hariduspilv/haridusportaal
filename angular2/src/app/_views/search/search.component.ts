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
    {"name": "article.label", "sumLabel": "Artikkel", "index": "elasticsearch_index_drupaldb_articles", "value": false},
    {"name": "news.label", "sumLabel": "Uudis", "index": "elasticsearch_index_drupaldb_news", "value": false},
    {"name": "event.label", "sumLabel": "Sündmus", "index": "elasticsearch_index_drupaldb_events", "value": false},
    {"name": "school.label", "sumLabel": "Kool", "index": "elasticsearch_index_drupaldb_schools", "value": false},
    {"name": "studyProgramme.label", "sumLabel": "Õppekava", "index": "elasticsearch_index_drupaldb_study_programmes", "value": false},
  ];
  sums = {"Artikkel": 0, "Kool": 0, "Sündmus": 0, "Uudis": 0, "Õppekava": 0};
    
  
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
    this.breadcrumbs = this.constructCrumbs()
  }

  getResults(term) {
    if( this.dataSubscription !== undefined ){
      this.dataSubscription.unsubscribe();
    }
    this.results = false;
    this.loading = true;
    this.listLimit = this.listStep;
    this.updateParams('term', term);
    let url = "http://test-htm.wiseman.ee:30000/graphql?queryId=homeSearch:1&variables=";
    if (window.location.host === ('test.edu.ee')) {
      url = "https://api.test.edu.ee/graphql?queryId=homeSearch:1&variables=";
    }
    
    let indexes = this.types.filter(elem => elem.value).map(item => item.index);

    let variables = {
      lang: this.rootScope.get('currentLang').toUpperCase(),
      search_term: term,
      indexes: indexes
    }
    this.dataSubscription = this.http.get(url+JSON.stringify(variables)).subscribe(data => {
      this.results = data['data']['CustomElasticQuery'];
      
      this.sums = {"Artikkel": 0, "Kool": 0, "Sündmus": 0, "Uudis": 0, "Õppekava": 0};
      this.results.forEach(res => {
        this.sums[res.ContentType] += 1;
      });
      
      this.breadcrumbs = this.constructCrumbs()
      this.listLength = this.results.length
      this.loading = false;
      this.dataSubscription.unsubscribe();
    });
  }
  
  loadMore() {
    const {listLimit, listLength, listStep} = this;
    this.listLimit = listLimit + listStep < listLength ? listLimit + listStep : listLength;
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

  filterView(id) {
    this.types[id].value = !this.types[id].value;
    this.getResults(this.param)
  }

}
