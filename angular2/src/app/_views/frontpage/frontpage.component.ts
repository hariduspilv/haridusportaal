import { Component } from '@angular/core';
import { RootScopeService, MetaTagsService, NewsService} from '@app/_services';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { recentQuery } from '@app/_graph/events.graph';
import { HttpService } from '@app/_services/httpService';
@Component({
  templateUrl: './frontpage.component.html',
  styleUrls: ['./frontpage.component.scss']
})

export class FrontpageComponent {

  error: boolean;
	news: Array<Object> = [];
	events: Array<Object> = [];
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
      url = "https://api.test.edu.ee/graphql?queryId=frontPageEvents:1&variables=";
    }
    let date = new Date();
    var formattedDate = `${date.getFullYear()}-${date.getMonth() <= 8 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)}-${date.getDate() <= 9 ? '0' + date.getDate() : date.getDate()}`;
    let variables = {
      lang: this.rootScope.get('currentLang').toUpperCase(),
      currentDate: formattedDate
    }
    this.http.get(url+JSON.stringify(variables)).subscribe(data => {
      this.events = data['data']['nodeQuery']['entities'];
    });
  }

  ngOnInit() {

    this.lang = this.router.url;
		let that = this;
		
		this.route.params.subscribe( params => {
			if (this.lang == "/en") {
        this.allPath = "/en/news";
        this.eventPath = "/en/events";
			} else if (this.lang == "/et") {
        this.allPath = "/et/uudised";
        this.eventPath = "/et/sundmused";
      } else if (this.lang !== '') {
        history.replaceState({}, '', '/et');
        this.router.navigateByUrl(`/et/404`);
      }
		});
		
		this.newsService.getRecent(null, function(data){
			if ( data['nodeQuery'] == null ) {
				that.error = true;
			} else {
				that.news = data['nodeQuery']['entities'];
			}
		});
		this.getEvents()
	}
}
