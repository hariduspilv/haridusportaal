import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SettingsService } from '@app/_services';
import { HttpClient } from '@angular/common/http';

@Component({
  templateUrl: 'frontpageView.template.html',
  styleUrls: ['./frontPageView.styles.scss'],
})

export class FrontpageViewComponent implements OnInit {
  public error: boolean;
  public searchError: boolean = false;
  public news: any = false;
  public superNewsShown: {} = {
    first: false,
    second: false,
  };
  public superNewsSubtext: Object[] = [];
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

  public eventsLink: Object = {
    name: 'button.view_all',
    url: '/sündmused',
  };
  public eventsLabels: Object = {
    title: 'entityLabel',
    date: 'fieldEventMainDate',
    subtext: 'fieldOrganizer',
    url: 'entityUrl',
  };
  public newsLink: Object = {
    name: 'button.view_all',
    url: '/uudised',
  };
  public newsLabels: Object = {
    title: 'entityLabel',
    image: 'fieldIntroductionImage',
    subtext: {
      author: 'fieldAuthor',
      date: 'created',
    },
    url: 'entityUrl',
  };
  public fieldTopicLabels: Object = {
    title: 'fieldTopicTitle',
    description: 'fieldTopicText',
    url: 'fieldTopicLink'
  };
  public fieldTopicImage: Object = {
    standard: '/assets/img/frontpage/frontpage-button-default.svg',
    hover: '/assets/img/frontpage/frontpage-button-hover.svg',
  };
  constructor (
    // private rootScope:RootScopeService,
    // private metaTags: MetaTagsService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private settings: SettingsService,
  ) {}

  getEvents() {

    const date = new Date();
    // tslint:disable-next-line: max-line-length
    const formattedDate = `${date.getFullYear()}-${date.getMonth() <= 8 ? `0${(date.getMonth() + 1)}` : (date.getMonth() + 1)}-${date.getDate() <= 9 ? `0${date.getDate()}` : date.getDate()}`;
    const variables = {
      lang: 'ET',
      currentDate: formattedDate,
    };
    const path = `${this.settings.query('frontPageEvents')}&variables=${JSON.stringify(variables)}`;
    this.http.get(path).subscribe(
      (data: any) => {
        if (data['errors'] && data['errors'].length) {
          this.events = [];
        } else {
          this.events = data['data']['nodeQuery']['entities'];
        }
      },
      (data) => {
        this.events = [];
      },
    );
  }
  getGeneral() {
    const variables = {
      lang: 'ET',
    };
    const path = `${this.settings.query('frontPageQuery')}&variables=${JSON.stringify(variables)}`;
    this.http.get(path).subscribe(
      (data: any) => {
        if (data['errors'] && data['errors'].length) {
          this.generalData = [];
        } else {
          this.generalData = data['data']['nodeQuery']['entities'];
          this.generalData[0].fieldTopics =
            this.generalData[0].fieldTopics.map(elem => elem.entity);
          this.generalData[0].fieldTopics
            .forEach(elem => elem.fieldTopicLink =
              elem.fieldTopicLink ? elem.fieldTopicLink.url : null);
          this.superNewsShown['first'] = this.superNewsValid(0);
          this.superNewsShown['second'] = this.superNewsValid(1);
          if (this.superNewsShown['first']) {
            this.superNewsSubtext[0] = {
              author: this.generalData[0]
                .fieldSupernews[0].entity.fieldSupernewsNode.entity.fieldAuthor,
              date: this.generalData[0].fieldSupernews[0].entity.fieldSupernewsNode.entity.created,
            }
          }
          if (this.superNewsShown['second']) {
            this.superNewsSubtext[1] = {
              author: this.generalData[0]
                .fieldSupernews[1].entity.fieldSupernewsNode.entity.fieldAuthor,
              date: this.generalData[0].fieldSupernews[1].entity.fieldSupernewsNode.entity.created,
            }
          }
        }
      },
      (data: any) => {
        this.generalData = [];
      });
  }

  searchRoute(param: any) {
    if (!param) {
      this.searchError = true;
    } else {
      const url = `/otsing?term=${param}`;
      this.router.navigateByUrl(url);
    }
  }

  superNewsValid(identifier: any) {
    const valid = true;
    // tslint:disable-next-line: max-line-length
    const superNewsPublished = this.generalData[0].fieldSupernews && this.generalData[0].fieldSupernews[identifier] && (this.generalData[0].fieldSupernews[identifier].entity.fieldPublishDate.unix * 1000);
    // tslint:disable-next-line: max-line-length
    const superNewsUnPublished = this.generalData[0].fieldSupernews && this.generalData[0].fieldSupernews[identifier] && this.generalData[0].fieldSupernews[identifier].entity.fieldUnpublishDate.unix && (this.generalData[0].fieldSupernews[identifier].entity.fieldUnpublishDate.unix * 1000);
    // tslint:disable-next-line: max-line-length
    const superNewsState = this.generalData[0].fieldSupernews && this.generalData[0].fieldSupernews[identifier] && this.generalData[0].fieldSupernews[identifier].entity.fieldSupernewsNode.entity.entityPublished;
    if (!superNewsState) { return false; }
    const dateNow = new Date();
    let superNewsPublishedVal;
    let superNewsUnPublishedVal;
    if (superNewsPublished) { superNewsPublishedVal = dateNow > new Date(superNewsPublished); }
    if (superNewsUnPublished) {
      superNewsUnPublishedVal = dateNow < new Date(superNewsUnPublished);
    } else {
      superNewsUnPublishedVal = true;
    }
    return superNewsPublishedVal && superNewsUnPublishedVal;
  }
  ngOnInit() {
    (document.activeElement as HTMLElement).blur();
    console.log('midagi nagu toimub?');
    this.lang = 'et';
    this.mobileView = window.innerWidth <= 1024;
    this.route.params.subscribe(() => {
      this.allPath = '/uudised';
      this.eventPath = '/sündmused';
      this.getGeneral();
      this.getEvents();
    });
    const variables = { lang: 'ET', nid: '0' };
    const path = `${this.settings.query('recentNews')}&variables=${JSON.stringify(variables)}`;
    this.http.get(path).subscribe((data: any) => {
      if (data['data']['nodeQuery'] == null) {
        this.error = true;
        this.news = [];
      } else {
        this.news = data['data']['nodeQuery']['entities'];
      }
    });

  }
  populateSuggestionList(searchText, debounceTime) {
    let sText = searchText;
    if (!sText) { sText = ''; }

    if (searchText.length < 3) {
      clearTimeout(this.debouncer);
      this.suggestionList = [];
      return;
    }
    if (this.debouncer) clearTimeout(this.debouncer);
    if (this.suggestionSubscription !== undefined) {
      this.suggestionSubscription.unsubscribe();
    }
    this.debouncer = setTimeout(
      () => {
        this.autocompleteLoader = true;

        const variables = {
          search_term: sText,
        };
        const path =
          `${this.settings.query('testAutocomplete')}&variables=${JSON.stringify(variables)}`;
        this.suggestionSubscription =
          this.http.get(path).subscribe((res: any) => {
            this.autocompleteLoader = false;
            this.suggestionList = res['data']['CustomElasticAutocompleteQuery'] || [];
            this.suggestionSubscription.unsubscribe();
          });
      },
      debounceTime,
    );
  }
}
