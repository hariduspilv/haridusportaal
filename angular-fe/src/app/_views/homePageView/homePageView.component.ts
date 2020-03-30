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
import { map } from 'rxjs/operators';

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
export class HomePageArticlesComponent {
  @Input() data: [] = [];
  @Input() theme: string;
  @Input() line: number = 1;

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }
}

@Component({
  selector: 'homepage-events',
  templateUrl: 'blocks/homePageView.events.html',
})
export class HomePageEventsComponent {
  @Input() data: [] = [];
  @Input() theme: string;
  @Input() title: string;
  @Input() description: string;
  @Input() line: number = 1;

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
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
  @Input() data: {};
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
  public contact: any;
  public slogan: string = '';
  public newsLink: string = '';
  public theme: string = 'default';
  public events: any[] = [];

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
    private route: ActivatedRoute,
  ) {}

  private getData(): void {
    const variables = {
      lang: 'ET',
    };

    const path = this.settings.query('newFrontPageQuery', variables);
    const topicsSubscription = this.http.get(path).subscribe((response) => {
      this.parseData(response['data']['nodeQuery']['entities'][0]);
      topicsSubscription.unsubscribe();
    });
  }

  private parseData(data): void {
    try {
      if (this.theme === 'teachers') {
        // TODO
        this.topics = [
          {
            title: 'Õpetaja',
            link: {
              title: 'Uuri lähemalt',
              url: {
                routed: false,
                path: 'https://www.neti.ee',
              },
            },
          },
          {
            title: 'Koolijuht',
            link: {
              title: 'Uuri lähemalt',
              url: {
                routed: true,
                path: '/sündmused',
              },
            },
          },
          {
            title: 'Noortevaldkonna töötaja',
            link: {
              title: 'Uuri lähemalt',
              url: {
                routed: false,
                path: 'https://www.google.ee',
              },
            },
          },
        ];
      } else {
        this.topics = data.fieldFrontpageTopics.map((item) => {
          return {
            title: item.entity.fieldTopicTitle,
            content: item.entity.fieldTopicText,
            link: item.entity.fieldTopicLink,
            image: item.entity.fieldTopicImage.entity.url,
            button: item.entity.fieldTopicButtonText,
          };
        });
      }
    } catch (err) {}

    try {
      this.contact = {
        email: data.fieldFrontpageContactEmail,
        name: data.fieldFrontpageContactName,
        phone: data.fieldFrontpageContactPhone,
      };

      if (this.theme === 'teachers') {
        // TODO
        this.contact.contacts = [
          {
            company: 'SA Kutsekoda',
            name: 'Doris-Marii Maxwell',
            email: 'doris-marii.maxwell@kutsekoda.ee',
          },
          {
            company: 'Eesti Töötukassa',
            name: 'Teele Traumann',
            email: 'karjaar@tootukassa.ee',
            skype: 'tootukassa',
          },
        ];

        this.contact.logos = ['/assets/img/homepage-teachers.svg'];

        this.contact.links = [
          {
            url: {
              title: 'Haridus- ja Teadusministeerium',
              path: 'http://www.neti.ee',
              routed: false,
            },
          },
          {
            url: {
              title: 'Eesti Haridustöötajate Liit',
              path: 'http://www.neti.ee',
              routed: false,
            },
          },
          {
            url: {
              title: 'Eesti Õpetajate Liit',
              path: 'http://www.neti.ee',
              routed: false,
            },
          },
          {
            url: {
              title: 'SA Innove',
              path: '/sündmused',
              routed: true,
            },
          },
        ];
      }
    } catch (err) {}

    this.slogan = data.fieldFrontpageQuote;

    try {
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
    } catch (err) {}

    try {
      this.newsLink = data.fieldFrontpageNews.entity.entityUrl.path;
    } catch (err) {}

    if (this.theme === 'teachers') {

      try {
        // tslint:disable
        this.events = [
          //TODO
          {
            title: 'Seminar “Meediapädevuse ja infokriitilisuse roll noorteinfotöös” noorsootöötajatele Tallinnas',
            author: 'Valgamaa Kutseõppekeskus',
            created: 1529585470,
            content: 'Turvalise interneti päeva töötuba digitaalse ohutuse toetamiseks, mida korraldavad Lastekaitse Liit, TalTech ja HITSA, turvalise interneti päeva töötuba digitaalse...',
            link: {
              title: 'Loe rohkem',
              url: {
                path: '/sündmused',
              }
            },
            image: {
              url: 'http://htm.wiseman.ee/sites/default/files/2020-02/homepage-slides-1.svg',
            },
          },
          {
            title: 'Inglise keele riigieksam',
            created: 1529585470,
            link: {
              title: 'Loe rohkem',
              url: {
                path: '/sündmused',
              }
            },
            image: {
              url: 'http://htm.wiseman.ee/sites/default/files/2020-02/homepage-slides-2.svg',
            },
          },
          
        ];
        // tslint:enable
      } catch (err) {}
    }

    if (this.articles) {
      this.articles = this.articles.map((item, index) => {
        let position = index % 2 ? 'left' : 'right';
        return {
          position,
          ...item,
        };
      });
    }

    if (this.topics) {
      this.topics = this.topics.map((item, index) => {
        let position = index % 2 ? 'left' : 'right';

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
