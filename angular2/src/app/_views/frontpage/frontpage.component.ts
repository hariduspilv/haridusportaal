import { Component } from '@angular/core';
import { RootScopeService, MetaTagsService} from '@app/_services';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SettingsService } from '@app/_core/settings';
import { HttpService } from '@app/_services/httpService';
import { Subscription } from 'rxjs';
@Component({
  templateUrl: './frontpage.component.html',
  styleUrls: ['./frontpage.component.scss']
})

export class FrontpageComponent {

  public error: boolean;
  public searchError: boolean = false;
  public news: any = false;
  public superNewsShown: {} = {
    'first': false,
    'second': false
  }
	public events: any = false;
	public generalData: any = false;
	public lang: string;
  public allPath: any;
  public eventPath: any;
  public suggestionList: any = false;
  public debouncer: any;
  public mobileView: boolean = false;
  public autocompleteLoader: boolean = false;
  public suggestionSubscription: Subscription;
  
  constructor (
    private rootScope:RootScopeService,
    private metaTags: MetaTagsService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpService,
    private settings: SettingsService
  ) {

    this.route.params.subscribe( params => {

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
  }

  getEvents() {
    let url = this.settings.url+"/graphql?queryName=frontPageEvents&queryId=8ce3b383b8846ecc8b100748f331e47d84683aa5:1&variables=";

    let date = new Date();
    var formattedDate = `${date.getFullYear()}-${date.getMonth() <= 8 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)}-${date.getDate() <= 9 ? '0' + date.getDate() : date.getDate()}`;
    let variables = {
      lang: this.rootScope.get('lang').toUpperCase(),
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
    let url = this.settings.url+"/graphql?queryName=frontPageQuery&queryId=c5f254677df76920cdc966cd190d1ee378613f92:1&variables=";
    
    let variables = {lang: this.rootScope.get('lang').toUpperCase()}
    this.http.get(url+JSON.stringify(variables)).subscribe(data => {
      if (data['errors'] && data['errors'].length) {
        this.generalData = [];
      } else {
        this.generalData = data['data']['nodeQuery']['entities'];
        this.superNewsShown['first'] = this.superNewsValid(0);
        this.superNewsShown['second'] = this.superNewsValid(1);
      }
    },(data) => {
      this.generalData = [];
    });
  }

  searchRoute(param) {
    if (!param) {
      this.searchError = true;
    } else {
      let url = "/otsing?term="+param;
      this.router.navigateByUrl(url)
    }
  }

  superNewsValid(identifier) {
    let valid = true;
    let superNewsPublished = this.generalData[0].fieldSupernews && this.generalData[0].fieldSupernews[identifier] && (this.generalData[0].fieldSupernews[identifier].entity.fieldPublishDate.unix * 1000);
    let superNewsUnPublished = this.generalData[0].fieldSupernews && this.generalData[0].fieldSupernews[identifier] && this.generalData[0].fieldSupernews[identifier].entity.fieldUnpublishDate.unix && (this.generalData[0].fieldSupernews[identifier].entity.fieldUnpublishDate.unix * 1000);
    let superNewsState = this.generalData[0].fieldSupernews && this.generalData[0].fieldSupernews[identifier] && this.generalData[0].fieldSupernews[identifier].entity.fieldSupernewsNode.entity.entityPublished;
    if (!superNewsState) {return false}
    let dateNow = new Date();
    if (superNewsPublished) { var superNewsPublishedVal = dateNow > new Date(superNewsPublished) };
    if (superNewsUnPublished) { var superNewsUnPublishedVal = dateNow < new Date(superNewsUnPublished) } else { superNewsUnPublishedVal = true; };
    return superNewsPublishedVal && superNewsUnPublishedVal;
  }
  ngOnInit() {
    (document.activeElement as HTMLElement).blur();
    this.lang = this.rootScope.get("lang");
    this.mobileView = window.innerWidth <= 1024;
		let that = this;
		this.route.params.subscribe(params => {
      this.allPath = "/uudised";
      this.eventPath = "/sündmused";
      this.getGeneral()
      this.getEvents()
    });

    let url = this.settings.url+"/graphql?queryName=recentNews&queryId=02772fa14a0888ba796a22398f91d384777290fa:1&variables=";
    
    let variables = {lang: this.rootScope.get('lang').toUpperCase(), nid: 0}

    let subscription = this.http.get(url+JSON.stringify(variables)).subscribe(data => {


      if ( data['data']['nodeQuery'] == null ) {
        that.error = true;
        that.news = [];
			} else {
        that.news = data['data']['nodeQuery']['entities'];
      }
    });

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
      let url = this.settings.url+"/graphql?queryId=27813a87b01c759d984808a9e9ea0333627ad584:1&variables=";
      let variables = {
        search_term: searchText
      }
      let suggestionSubscription = this.http.get(url+JSON.stringify(variables)).subscribe(res => {
        this.autocompleteLoader = false;
        this.suggestionList = res['data']['CustomElasticAutocompleteQuery'] || [];
        this.suggestionSubscription.unsubscribe();
      });

    }, debounceTime)
  }
}
