import { HttpClient } from '@angular/common/http';
import {
  Component,
  OnDestroy,
  AfterViewInit,
  Input, ViewChild,
  ChangeDetectorRef,
  HostBinding,
} from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { SettingsService, AlertsService, ModalService } from '@app/_services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'homepage-footer',
  templateUrl: 'homePageView.footer.html',
})
export class HomePageFooterComponent implements OnDestroy, AfterViewInit {
  @Input() data: {
    links,
    logos,
    contacts: [],
  };
  @Input() theme: string;
  @Input() line: number = 4;
  public subscribedStatus: boolean = false;
  public subscribedError: boolean = false;
  public loading: boolean = false;
  public formGroup: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });
  @ViewChild('scrollTarget') public scrollTarget;
  private lang: string = 'ET';
  private subscriptions: Subscription[] = [];
  private tags: string = '';

  constructor(
    public settings: SettingsService,
    private formBuilder: FormBuilder,
    private alertsService: AlertsService,
    private translate: TranslateService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private modalService: ModalService,
    private route: ActivatedRoute,
  ) {
  }

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }

  public resetView(): void {
    this.subscribedError = false;
    this.subscribedStatus = false;
    this.alertsService.clear('newsletter-order');
  }

  public submit(): void {

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
      window.setTimeout(() => {
        this.scrollTarget.el.nativeElement.scrollIntoView({ behavior: 'smooth' });
      },                100);
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

  private subscriptionModal(token: string): void {
    this.modalService.toggle('subscribe');
    const data = {
      variables: { token },
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
      } catch (err) {
      }

    });
    this.subscriptions.push(subscription);
  }
}