import { Component, OnInit, OnDestroy, ChangeDetectorRef, ɵConsole } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router'
import { Subscription } from 'rxjs';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { SettingsService, ModalService, AlertsService } from '@app/_services';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'newsletter-order',
  templateUrl: './newsletter-order.component.html',
  styleUrls: ['./newsletter-order.component.scss']
})

export class NewsletterOrderComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];

  lang: string;

  data: any;

  formItems: object = {};
  email: string = '';
  errors: object = {};
  rssIDs: string;

  subscriptionSuccessContent: string = '';
  subscribedStatus: boolean = false;
  allChecked: boolean = false;
  subscribedFailure: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    // public dialog: MatDialog,
    private translate: TranslateService,
    private modalService: ModalService,
    private settings: SettingsService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private alertsService: AlertsService,
  ) { }

  updateItems() {
    this.data.forEach(elem => this.formItems[elem.entityId] = this.allChecked);
  }

  updateRSSLink() {
    this.rssIDs = '/';

    for (let i in this.formItems) {
      if (this.formItems[i]) {
        if (this.rssIDs !== '/') { this.rssIDs += ','; }
        this.rssIDs += i;

      }
    }

  }
  ngOnInit() {
    this.lang = 'et';
    this.initialize();
  }

  initialize() {
    const paramsSub = this.route.params.subscribe(
      (params: ActivatedRoute) => {

        this.data = false;
        const variables = {
          lang: this.lang.toUpperCase(),
        };
        const query = `${this.settings.query('newsletterTags')}&variables=${JSON.stringify(variables)}`;

        const subscribe = this.http.get(query).subscribe((response) => {
          const data = response['data'];
          this.data = data['taxonomyTermQuery']['entities'];
          subscribe.unsubscribe();
        });

        this.subscriptions = [...this.subscriptions];

      }
    )
    this.subscriptions = [...this.subscriptions, paramsSub];
  }
  resetView() {
    this.subscribedStatus = false;
    this.subscribedFailure = '';
    this.initialize();
  }

  // scrollElementIntoView = (element: HTMLElement, behavior?: 'smooth' | 'instant' | 'auto') => {

  //   let scrollTop = window.pageYOffset || element.scrollTop;
  //   const headerOutsideIframe = window.parent.document.getElementsByClassName('maincontent')[0].clientHeight;
  //   const finalOffset = element.getBoundingClientRect().top + scrollTop + headerOutsideIframe;

  //   window.parent.scrollTo({
  //     top: finalOffset,
  //     behavior: behavior || 'auto'
  //   })
  // }
  scrollElementIntoView(element) {
    try {
      element.scrollIntoView(true);
    } catch (er) {

      let T = 0;
      let reference = element;
      while (reference.parentNode) {
        T += (reference.offsetTop) ? reference.offsetTop : 0;
        if (reference === document.body) break;
        reference = reference.parentNode;
      }
      window.scrollTo(0, T);
    }
    try {
      element.focus();
    } catch (er) {
      return true;
    }
  }

  submit() {
    this.alertsService.clear('newsletter-order');
    this.errors = {};

    const emailRegex = new RegExp(/[^@\s]+@[^@\s]+\.[^@\s][^@\s]+/gm);

    this.errors['email'] = !this.email.match(emailRegex);

    if (this.errors['email']) {
      this.alertsService.error(this.translate.get('newsletter.valid_email'), 'newsletter-order');
      return;
    }

    let output = '';

    let counter = 0;
    for (let i in this.formItems) {
      if (!this.formItems[i]) { continue; }
      output += output === '' ? i : `, ${i}`;
      counter += 1;
    }

    this.errors['items'] = counter > 0 ? false : true;

    if (this.errors['items']) {
      this.alertsService.error(
        this.translate.get('newsletter.subscription_choose_one'), 'newsletter-order',
      );
      return;
    }

    let errorCounter = 0;
    for (const i in this.errors) {
      if (this.errors[i]) {
        errorCounter += 1;
      }
    }

    if (errorCounter > 0) {
      return false;
    }

    this.data = false;
    const data = {
      queryId: 'b6b08eb9a6d99bdfcfb3bf9f980830c2d7d3c3fb:1',
      variables: {
        lang: this.lang.toUpperCase(),
        email: this.email,
        tags: output,
      },
    };

    const element = document.getElementById('blockTop');
    this.scrollElementIntoView(element);
    const query = `${this.settings.query('newsletterSignup')}`;
    const register = this.http.post(query, data).subscribe(
      (response) => {
        this.subscribedStatus = true;
        register.unsubscribe();
      },
      (data) => {
        this.subscribedStatus = true;
        this.subscribedFailure = data;
        register.unsubscribe();
      });

    this.subscriptions = [...this.subscriptions];
  }

  subscriptionModal(token: string) {
    this.modalService.toggle('subscribe');
    const data = {
      variables: { token },
      queryId: '884704e2d1dd58c5b9eb3e1c237e46985301d36c:1',
    };
    const query = `${this.settings.query('newsletterActivate')}`;
    const subscribe = this.http.post(query, data).subscribe((response) => {
      subscribe.unsubscribe();
    });
    this.subscriptions = [...this.subscriptions];
  }

  unsubscriptionModal(token: string) {
    this.modalService.toggle('unsubscribe');
    const data = {
      queryId: "550a90c42d4bb032cab8fd8ff5fb3e3b448c9596:1",
      variables: { token },
    };
    const query = `${this.settings.query('newsletterDeactivate')}`;
    const subscribe = this.http.post(query, data).subscribe((response) => {
      subscribe.unsubscribe();
    });
    this.subscriptions = [...this.subscriptions];
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
    for (const item of this.subscriptions) {
      if (item && item.unsubscribe) {
        item.unsubscribe();
      }
    }
  }

}