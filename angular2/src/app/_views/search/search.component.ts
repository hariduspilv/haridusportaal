import { Component } from '@angular/core';
import { RootScopeService } from '@app/_services';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '@app/_services/httpService';
@Component({
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})

export class SearchComponent {
  
  results: any = false;
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
    this.http.get(url+JSON.stringify(variables)).subscribe(data => {
      this.results = data['data']['CustomElasticQuery'];
      this.breadcrumbs = this.constructCrumbs()
      this.listLength = this.results.length
      this.loading = false;
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

}
