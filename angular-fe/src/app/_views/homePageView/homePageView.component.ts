import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
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
  @Input() type: string = '1';
}

@Component({
  selector: 'homepage-navblock',
  templateUrl: 'blocks/homePageView.navblock.html',
})
export class HomePageNavBlockComponent {
  @Input() data;
}

@Component({
  selector: 'homepage-articles',
  templateUrl: 'blocks/homePageView.articles.html',
})
export class HomePageArticlesComponent {
  @Input() data: [] = [];
}

@Component({
  selector: 'homepage-slides',
  templateUrl: 'blocks/homePageView.slides.html',
})
export class HomePageSlidesComponent {
  @Input() data: [] = [];
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
export class HomePageStudyComponent {}

@Component({
  selector: 'homepage-slogan',
  templateUrl: 'blocks/homePageView.slogan.html',
})
export class HomePageSloganComponent {
  @Input() data: string = '';
}

@Component({
  selector: 'homepage-footer',
  templateUrl: 'blocks/homePageView.footer.html',
})
export class HomePageFooterComponent implements OnDestroy, AfterViewInit{
  @Input() data: {};

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

      console.log(this.tags);
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
  public services: any[] = [];
  public contact: any;
  public slogan: string = '';
  public newsLink: string = '';

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
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
      this.topics = data.fieldFrontpageTopics.map((item) => {
        return {
          title: item.entity.fieldTopicTitle,
          content: item.entity.fieldTopicText,
          link: item.entity.fieldTopicLink,
          image: item.entity.fieldTopicImage.entity.url,
          button: item.entity.fieldTopicButtonText,
        };
      });
    } catch (err) {}

    try {
      this.contact = {
        email: data.fieldFrontpageContactEmail,
        name: data.fieldFrontpageContactName,
        phone: data.fieldFrontpageContactPhone,
      };
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

  }

  ngOnInit() {
    this.getData();
  }
}
