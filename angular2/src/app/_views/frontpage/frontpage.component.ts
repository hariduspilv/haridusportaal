import { Component } from '@angular/core';
import { RootScopeService, MetaTagsService, NewsService} from '@app/_services';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';

import { HttpService } from '@app/_services/httpService';
@Component({
  templateUrl: './frontpage.component.html',
  styleUrls: ['./frontpage.component.scss']
})

export class FrontpageComponent {

  error: boolean;
  searchError: boolean = false;
  news: any = false;
  superNewsShown: boolean = false;
	events: any = false;
	generalData: any = false;
	lang: string;
  allPath: any;
  eventPath: any;
  
  constructor (
    private rootScope:RootScopeService,
    private newsService: NewsService,
    private metaTags: MetaTagsService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private apollo: Apollo,
    private http: HttpService
  ) {

    this.route.params.subscribe( params => {
        
      const defaultLang = translate.getDefaultLang();

      const translations = translate.translations;

      translate.get('frontpage.label').subscribe((res: string) => {
        metaTags.set([
          {
            "name": "title",
            "content": res
          }
        ]);
      });

    });

    this.rootScope.set('langOptions', {
      'en': '/en',
      'et': '/et',
    });
  }

  getEvents() {
    let url = "http://test-htm.wiseman.ee:30000/graphql?queryId=frontPageEvents:1&variables=";
    if (window.location.host === ('test.edu.ee')) {
      url = "https://apitest.hp.edu.ee/graphql?queryId=frontPageEvents:1&variables=";
    }
    let date = new Date();
    var formattedDate = `${date.getFullYear()}-${date.getMonth() <= 8 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)}-${date.getDate() <= 9 ? '0' + date.getDate() : date.getDate()}`;
    let variables = {
      lang: this.rootScope.get('currentLang').toUpperCase(),
      currentDate: formattedDate
    }
    this.http.get(url+JSON.stringify(variables)).subscribe(data => {
      if (data['errors'] && data['errors'].length) {
        this.events = [];
      } else {
        this.events = data['data']['nodeQuery']['entities'];
      }
    },(data) => {
      this.events = [];
    });
  }
  
  getGeneral() {
    let url = "http://test-htm.wiseman.ee:30000/graphql?queryId=frontPageQuery:1&variables=";
    if (window.location.host === ('test.edu.ee')) {
      url = "https://apitest.hp.edu.ee/graphql?queryId=frontPageQuery:1&variables=";
    }
    let variables = {lang: this.rootScope.get('currentLang').toUpperCase()}
    this.http.get(url+JSON.stringify(variables)).subscribe(data => {
      if (data['errors'] && data['errors'].length) {
        this.generalData = [];
      } else {
        this.generalData = data['data']['nodeQuery']['entities'];
        this.superNewsShown = this.superNewsValid();
      }
    },(data) => {
      this.generalData = [];
    });
  }

  searchRoute(param) {
    if (!param) {
      this.searchError = true;
    } else {
      let url = this.lang === '/et' ? `/et/otsing?term=${param}` : `/en/search?term=${param}`
      this.router.navigateByUrl(url)
    }
  }

  superNewsValid() {
    var valid = true;
    let superNewsPublished = this.generalData[0].fieldSupernewsPublishDate && (this.generalData[0].fieldSupernewsPublishDate.unix * 1000);
    let superNewsUnPublished = this.generalData[0].fieldSupernewsUnpublishDate && this.generalData[0].fieldSupernewsUnpublishDate.unix && (this.generalData[0].fieldSupernewsUnpublishDate.unix * 1000);
    let dateNow = new Date();
    if (superNewsPublished) { var superNewsPublishedVal = dateNow > new Date(superNewsPublished) };
    if (superNewsUnPublished) { var superNewsUnPublishedVal = dateNow < new Date(superNewsUnPublished) } else { superNewsUnPublishedVal = true; };
    return superNewsPublishedVal && superNewsUnPublishedVal;
  }
  ngOnInit() {
    (document.activeElement as HTMLElement).blur();
    this.lang = this.router.url;
		let that = this;
		this.route.params.subscribe(params => {
			if (this.lang === '/en' || this.lang.includes('/en?')) {
        this.allPath = "/en/news";
        this.eventPath = "/en/events";
			} else if (this.lang === '/et' || this.lang.includes('/et?')) {
        this.allPath = "/et/uudised";
        this.eventPath = "/et/sundmused";
      } else if (this.lang !== '') {
        this.router.navigateByUrl(`/${this.lang}/404`, {replaceUrl: true});
      }
      this.getGeneral()
      this.getEvents()
    });

		this.newsService.getRecent(null, function(data){
			if ( data['nodeQuery'] == null ) {
        that.error = true;
        that.news = [];
			} else {
        that.news = data['nodeQuery']['entities'];
      }
    });
	}
}
