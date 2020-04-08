import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  HostBinding,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService, AlertsService, ModalService } from '@app/_services';
import FieldVaryService from '@app/_services/FieldVaryService';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'homepage-line',
  templateUrl: 'homePageView.line.html',
})
export class HomePageLineComponent {
  @Input() type: number = 1;
}

@Component({
  selector: 'homepage-navblock',
  templateUrl: 'blocks/homePageView.navblock.html',
})
export class HomePageNavBlockComponent {
  @Input() data;
  @Input() title: string;
  @Input() description: string;
  @Input() theme: string;
  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }

}

@Component({
  selector: 'homepage-articles',
  templateUrl: 'blocks/homePageView.articles.html',
})
export class HomePageArticlesComponent implements OnChanges {
  @Input() data: any[] = [];
  @Input() theme: string;
  @Input() line: number = 1;

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }

  private imageList: string[] = [
    'homepage-articles-1.svg',
    'homepage-articles-2.svg',
    'homepage-articles-3.svg',
  ];

  private assignImages() {

    if (this.theme === 'career') {
      this.imageList = [
        'homepage-articles-career-1.svg',
      ];
    }
    let counter = 0;
    this.data = this.data.map((item, index) => {
      if (counter >= this.imageList.length) {
        counter = 0;
      }
      const image = `/assets/img/${this.imageList[counter]}`;
      counter = counter + 1;
      return {
        ... item,
        image,
      };
    });
  }

  ngOnChanges() {
    if (this.data) {
      this.assignImages();
    }
  }
}

@Component({
  selector: 'homepage-events',
  templateUrl: 'blocks/homePageView.events.html',
})
export class HomePageEventsComponent implements OnInit{
  @Input() data: any[] = [];
  @Input() theme: string;
  @Input() title: string;
  @Input() description: string;
  @Input() line: number = 1;

  private eventsAmount = 2;

  private imageList: string[] = [
    'homePage-events-1.svg',
    'homePage-events-2.svg',
  ];

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
    private translate: TranslateService,
  ) {}

  private assignImages() {
    let counter = 0;
    this.data = this.data.map((item, index) => {
      if (counter >= this.imageList.length) {
        counter = 0;
      }
      const image = `/assets/img/${this.imageList[counter]}`;
      counter = counter + 1;
      return {
        ... item,
        image: {
          url: image,
        },
      };
    });
  }

  private getAdditional(entities): void {
    const variables = {
      lang: 'ET',
    };
    const query = this.settings.query('teachingPageAdditionalEvents', variables);
    const subscription = this.http.get(query).subscribe((response:any) => {
      try {
        this.data = [
          ...this.parseEvents(entities),
          ...this.parseEvents(response.data.nodeQuery.entities),
        ].slice(0, this.eventsAmount);
        this.assignImages();
      } catch (err) {}
    });
  }

  private parseEvents(items) {
    return items.map((item) => {
      return {
        title: item.entityLabel,
        author: item.fieldOrganizer,
        created: item.fieldEventMainDate.unix,
        content: item.fieldDescriptionSummary,
        link: {
          title: this.translate.get('button.read_more'),
          url: {
            path: item.entityUrl.path,
          },
        },
        image: {
          url: 'http://htm.wiseman.ee/sites/default/files/2020-02/homepage-slides-1.svg',
        },
      };
    });
  }
  private getData():void {

    const variables = {
      lang: 'ET',
    };
    const query = this.settings.query('teachingPageEvents', variables);

    const subscription = this.http.get(query).subscribe((response:any) => {
      try {
        if (response.data.nodeQuery.entities.length < this.eventsAmount) {
          this.getAdditional(response.data.nodeQuery.entities);
        } else {
          this.data = this.parseEvents(response.data.nodeQuery.entities);
          this.assignImages();
        }
      } catch (err) {}
      subscription.unsubscribe();
    });
  }

  ngOnInit() {
    this.getData();
  }
}

@Component({
  selector: 'homepage-careerDevelopment',
  templateUrl: 'blocks/homePageView.careerDevelopment.html',
})
export class HomePageCareerDevelopmentComponent implements OnInit{
  @Input() title: string;
  @Input() description: string;
  @Input() url: string;
  @Input() theme: string;
  @Input() line: number = 3;
  public data: any[] = [];

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
  ) {}

  private getData(): void {
    const variables = {
      path: this.url,
    };
    const query = this.settings.query('getArticle', variables);
    const subscription = this.http.get(query).subscribe((response:any) => {
      try {
        const accordionData = response.data.route.entity.fieldAccordionSection;
        this.data = accordionData.map((item) => {
          const slug = item.entity.fieldAccordionTitle.toLowerCase()
            .replace(/span/g, '')
            .replace(/<a href=".+?>/g, '')
            .replace(/<\/a>/g, '')
            .replace(/ /g, '-')
            .replace(/[^A-Za-z0-9üõöä]+/igm, '-');
          return {
            slug,
            title: item.entity.fieldAccordionTitle,
            path: this.url,
          };
        });
      } catch (err) {}
      subscription.unsubscribe();
    });
  }

  ngOnInit() {
    if (this.url) {
      this.getData();
    }
  }
}

@Component({
  selector: 'homepage-slides',
  templateUrl: 'blocks/homePageView.slides.html',
})
export class HomePageSlidesComponent {
  @Input() title: string;
  @Input() data: [] = [];
  @Input() theme: string;
  @Input() line: number = 2;
  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }
}

@Component({
  selector: 'homepage-topical',
  templateUrl: 'blocks/homePageView.topical.html',
})
export class HomePageTopicalComponent implements OnInit, OnChanges{
  constructor(
    private http: HttpClient,
    private settings: SettingsService,
  ) {}

  @Input() data: string;
  @Input() theme: string;
  @Input() line: number = 2;
  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }
  public article: any = {
    title: '',
    path: '',
  };

  private getData() {
    if (!this.data) { return false; }
    const variables = {
      path: this.data,
    };
    const query = this.settings.query('newsSingel', variables);
    const subscription = this.http.get(query).subscribe((response) => {
      this.article = {
        title: '',
        ... FieldVaryService(response['data']['route']['entity']),
        path: this.data,
      };
      subscription.unsubscribe();
    });
  }

  ngOnInit() {
    this.getData();
  }
  ngOnChanges() {
    this.getData();
  }
}

@Component({
  selector: 'homepage-study',
  templateUrl: 'blocks/homePageView.study.html',
})
export class HomePageStudyComponent {
  @Input() theme: string;
  @Input() line: number = 3;
  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }
}

@Component({
  selector: 'homepage-slogan',
  templateUrl: 'blocks/homePageView.slogan.html',
})
export class HomePageSloganComponent {
  @Input() title: string = '';
  @Input() person: string;
  @Input() company: string;
  @Input() theme: string;
  @Input() line: number = 2;
  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }
}

@Component({
  selector: 'homepage-footer',
  templateUrl: 'blocks/homePageView.footer.html',
})
export class HomePageFooterComponent implements OnDestroy, AfterViewInit{
  @Input() data: {
    links,
    logos,
    contacts: [],
  };
  @Input() theme: string;
  @Input() line: number = 4;

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }

  private lang: string = 'ET';

  private subscriptions: Subscription[] = [];
  public subscribedStatus: boolean = false;
  public subscribedError: boolean = false;
  public loading: boolean = false;
  private tags: string = '';

  public formGroup: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(
    public settings: SettingsService,
    private formBuilder: FormBuilder,
    private alertsService: AlertsService,
    private translate: TranslateService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private modalService: ModalService,
    private route: ActivatedRoute,
  ) {}

  public resetView(): void {
    this.subscribedError = false;
    this.subscribedStatus = false;
    this.alertsService.clear('newsletter-order');
  }
  public submit():void {

    const data = {
      queryId: this.settings.queryID('newsletterSignup'),
      variables: {
        lang: this.lang,
        email: this.formGroup.controls.email.value,
        tags: this.tags,
      },
    };
    const query = `${this.settings.query('newsletterSignup')}`;

    this.alertsService.clear('newsletter-order');

    if (this.formGroup.invalid) {
      this.alertsService.error(this.translate.get('newsletter.valid_email'), 'newsletter-order');
    } else {
      this.loading = true;
      const subscription = this.http.post(query, data).subscribe(
        (response) => {
          this.subscribedStatus = true;
          this.loading = false;
        },
        (data) => {
          this.subscribedError = true;
          this.loading = false;
        });
      this.subscriptions.push(subscription);
    }
  }

  private subscriptionModal(token: string): void {
    this.modalService.toggle('subscribe');
    const data = {
      variables: { token },
      queryId: this.settings.queryID('newsletterActivate'),
    };

    const query = `${this.settings.query('newsletterActivate')}`;
    const subscribe = this.http.post(query, data).subscribe((response) => {
    });
    this.subscriptions.push(subscribe);
  }

  private unsubscriptionModal(token: string): void {
    this.modalService.toggle('unsubscribe');
    const data = {
      queryId: this.settings.queryID('newsletterDeactivate'),
      variables: { token },
    };
    const query = `${this.settings.query('newsletterDeactivate')}`;
    const subscribe = this.http.post(query, data).subscribe((response) => {
      subscribe.unsubscribe();
    });
    this.subscriptions.push(subscribe);
  }

  private getTags(): void {
    const variables = {
      lang: this.lang,
    };

    const path = this.settings.query('newsletterTags', variables);

    const subscription = this.http.get(path).subscribe((response) => {
      try {
        this.tags = response['data'].taxonomyTermQuery.entities.map((item) => {
          return item.entityId;
        }).join(', ');
      } catch (err) {}

    });
    this.subscriptions.push(subscription);
  }

  ngOnInit() {
    this.getTags();
  }
  ngAfterViewInit(): void {
    if (this.route.snapshot.queryParams['confirmsubscription']) {
      this.subscriptionModal(this.route.snapshot.queryParams['confirmsubscription']);
    } else if (this.route.snapshot.queryParams['unsubscribe']) {
      this.unsubscriptionModal(this.route.snapshot.queryParams['unsubscribe']);
    }
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}

@Component({
  selector: 'homepage',
  templateUrl: 'homePageView.template.html',
  styleUrls: ['homePageView.styles.scss'],
})

export class HomePageViewComponent implements OnInit {
  public topics: any[] = [];
  public articles: any[];
  public services: any[] = [];
  public contact: any = {};
  public slogan: any = '';
  public newsLink: string = '';
  public theme: string = 'default';
  public events: any[] = [];
  public careerDevelopment: string;

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
    private route: ActivatedRoute,
    private translate: TranslateService,
  ) {}

  private getData(): void {
    const variables = {
      lang: 'ET',
    };

    let query = 'newFrontPageQuery';
    if (this.theme === 'teachers') {
      query = 'teachingPage';
    } else if (this.theme === 'career') {
      query = 'careerPage';
    }

    const path = this.settings.query(query, variables);
    const topicsSubscription = this.http.get(path).subscribe((response) => {
      this.parseData(response['data']['nodeQuery']['entities'][0]);
      topicsSubscription.unsubscribe();
    });
  }

  private parseData(data): void {

    try {
      if (this.theme === 'career') {
        this.careerDevelopment = data.fieldCareer.entity.entityUrl.path;
      }
    } catch (err) {}

    try {
      const topics = data.fieldFrontpageTopics ||
        data.fieldTeachingThemes ||
        data.fieldContentPageLink;

      if (this.theme === 'career') {

        const item = topics;
        this.articles = [{
          title: item.entity.fieldTitle,
          content: item.entity.fieldText,
          link: {
            title: this.translate.get('home.view_more'),
            url: {
              routed: item.entity.fieldInternalLink.entity.entityUrl.routed,
              path: item.entity.fieldInternalLink.entity.entityUrl.path,
            },
          },
          image: '/assets/img/homepage-articles-career-1.svg',
        }];

        this.topics = [
          {
            title: 'VALDKONNAD TÖÖTURUL',
            link: {
              title: this.translate.get('home.view_more'),
              url: {
                path: '/valdkonnad',
                routed: true,
              },
            },
          },
          {
            title: 'AMETIALAD',
            link: {
              title: this.translate.get('home.view_more'),
              url: {
                path: '/ametialad',
                routed: true,
              },
            },
          },
        ];
      } else {
        this.topics = topics.map((item) => {
          let image:any = false;
          let link;
          let scrollTo: boolean | string = false;

          if (this.theme === 'default') {
            image = '';
            link = item.entity.fieldTopicLink;
            if (link.url.path.match('scrollTo:')) {
              scrollTo = link.url.path.split('scrollTo:')[1];
            }
          } else if (this.theme === 'teachers') {
            link = {
              title: this.translate.get('home.view_more'),
              url: {
                path: item.entity.fieldInternalLink.entity.entityUrl.path,
                routed: item.entity.fieldInternalLink.entity.entityUrl.routed,
              },
            };
          }

          return {
            image,
            link,
            scrollTo,
            title: item.entity.fieldTopicTitle || item.entity.fieldThemeTitle,
            content: item.entity.fieldTopicText || false,
            button: item.entity.fieldTopicButtonText || false,
          };
        });
      }
    } catch (err) {}

    try {
      if (this.theme === 'teachers' || this.theme === 'career') {
        const contact = data.fieldContact || data.fieldCareerContact;
        this.contact.contacts = contact.map((item) => {
          return {
            company: item.entity.fieldInstitution || false,
            name: item.entity.fieldNameOccupation || false,
            email: item.entity.fieldEmail || false,
            skype: item.entity.fieldSkype || false,
          };
        });

        if (this.theme === 'teachers') {
          this.contact.logos = [
            {
              src: '/assets/img/homepage-teachers.svg',
              label: 'Logo - Õpetajad loovad homse eesti',
            },
          ];
        } else if (this.theme === 'career') {
          this.contact.logos = [
            {
              src: '/assets/img/homepage-footer-career-1.svg',
              label: 'Logo - sihtasutus Kutsekoda',
            },
            {
              src: '/assets/img/homepage-footer-career-2.svg',
              label: 'Logo - OSKA',
            },
            {
              src: '/assets/img/homepage-footer-career-3.svg',
              label: 'Logo - Eesti töötukassa',
            },
          ];
        }

        const links = data.fieldExternal || data.fieldExternalLinks;
        this.contact.links = links.map((item) => {
          return {
            url: {
              title: item.entity.fieldLinkName,
              path: item.entity.fieldWebpageLink.url.path,
              routed: false,
            },
          };
        });
      } else {
        this.contact = {
          email: data.fieldFrontpageContactEmail,
          name: data.fieldFrontpageContactName,
          phone: data.fieldFrontpageContactPhone,
        };
      }
    } catch (err) {}

    try {
      if (this.theme === 'teachers' || this.theme === 'career') {
        this.slogan = {
          title: data.fieldQuoteText || false,
          person: data.fieldQuoteAuthor || false,
          company: data.fieldQuoteAuthorOccupation || false,
        };
      } else {
        this.slogan = data.fieldFrontpageQuote;
      }
    } catch (err) {}

    try {
      if (this.theme === 'default') {
        this.services = data.fieldFrontpageServices.map((item) => {
          const image = item.entity.fieldServiceImage.entity;
          const alt = image ? image.fieldAlt : undefined;
          const url = image && image.fieldServiceImg.entity ?
          image.fieldServiceImg.entity.url : undefined;
          return {
            title: item.entity.fieldServiceTitle,
            link: item.entity.fieldServiceLink,
            image: {
              alt,
              url,
            },
            content: item.entity.fieldServiceContent,
          };
        });
      } else {
        this.services = data.fieldToolbox.map((item) => {
          const image = item.entity.fieldToolboxImage.entity.url;
          return {
            title: item.entity.fieldTitle,
            link: {
              title: item.entity.fieldLinkName,
              url: item.entity.fieldInternalLink.entity.entityUrl,
            },
            image: {
              url: image,
            },
            content: item.entity.fieldContent,
          };
        });
      }
    } catch (err) {}

    try {
      if (this.theme === 'teachers') {
        this.newsLink = data.fieldTeachingNews.entity.entityUrl.path;
      } else {
        this.newsLink = data.fieldFrontpageNews.entity.entityUrl.path;
      }
    } catch (err) {}

    if (!this.articles && this.topics) {
      this.articles = this.topics;
    }

    if (this.articles) {
      this.articles = this.articles.map((item, index) => {
        let position = index % 2 ? 'left' : 'right';

        if (this.theme === 'career') {
          position = index % 2 ? 'right' : 'left';
        }
        return {
          position,
          ...item,
        };
      }).filter((item) => {
        return item.title !== '-';
      });
    }

    if (this.topics) {
      this.topics = this.topics.map((item, index) => {
        let position = index % 2 ? 'left' : 'right';
        if (this.theme === 'career') {
          position = index % 2 ? 'right' : 'left';
        }
        return {
          position,
          ...item,
        };
      });
    }

  }

  ngOnInit() {
    this.route.data.subscribe((response) => {
      this.theme = response.theme || this.theme;
      this.getData();
    });
  }
}
