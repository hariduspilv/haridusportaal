import { Component, OnDestroy, OnInit, Input, HostListener } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Params, Router, ActivatedRoute } from '@angular/router';
import { RootScopeService } from '../../_services';

import { Subscription } from 'rxjs/Subscription';

import { throwMatDialogContentAlreadyAttachedError } from '@angular/material';
import { VideoComponent } from '@app/_components/video/video.component';
import { HttpService } from '@app/_services/httpService';
import { UserService } from '@app/_services/userService';
import slugify from 'slugify';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'article-component',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})

export class ArticleComponent implements OnInit, OnDestroy {

  @Input() inputData: any;

  private querySubscription: Subscription;
  private path: string;
  private lang: string;
  private userLoggedOut = false;

  content: any;
  error: boolean;

  accordionOpenState = false;
  accordionSection: any[];

  fieldRightSidebar: any;

  fieldAdditional: any;
  fieldAdditionalTitle: any;
  fieldAdditionalBody: any;

  fieldContactSection: any;
  fieldContactPerson: any;
  fieldContactPhone: any;
  fieldContactEmail: any;
  fieldContactOrganization: any;
  accordionHeight: '\'2.5rem\'';

  articleLinks: any[];
  relatedArticles: any[];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private rootScope: RootScopeService,
    private http: HttpService,
    private user: UserService
    ) {}

  setActivePanelUrl(slug): void {
    this.location.go(this.location.path() + '#accordion=' + slug);
  }

  accordionPosition(): void {
    const hash = this.location.path(true).split("#")[1];
    if (hash) {
      const hashParts = hash.split('&')
      .map(p => p.split('='))
      .reduce((obj, pair) => {
        const [key, value] = pair.map(decodeURIComponent);
        return ({ ...obj, [key]: value })
      }, {});

      if (hashParts['accordion']) {
        this.accordionSection.forEach((item) => {
          if (item.entity.slug  === hashParts['accordion']) {
            item.opened = true;
          } else {
            item.opened = false;
          }
        });
        const activeElem = document.querySelector('#' + hashParts['accordion']);
        const activeElemTop = activeElem.getBoundingClientRect().top;
        document.querySelector('html').scrollTo({
          top: activeElemTop,
          behavior: 'smooth'
        });
      }
    }
  }

  parseData( data ) {

    data = data['entity'] || data;
    this.content = data;
    this.accordionSection = data['fieldAccordionSection'];

    if (this.accordionSection && this.accordionSection.length) {
      this.accordionSection.forEach((item) => {
        item['entity']['slug'] = slugify(item['entity']['fieldAccordionTitle'], {
          lower: true,
        });
      });
      setTimeout(() => {
        this.accordionPosition();
      }, 0);
    }

    this.fieldRightSidebar = data['fieldRightSidebar'];

    if (this.fieldRightSidebar !== null) {

      this.fieldRightSidebar = data['fieldRightSidebar']['entity'];

      this.fieldContactSection = this.fieldRightSidebar['fieldContactSection'];
      this.fieldAdditional = this.fieldRightSidebar['fieldAdditional'];
      this.articleLinks = this.fieldRightSidebar['fieldHyperlinks'];
      this.relatedArticles = this.fieldRightSidebar['fieldRelatedArticle'];

      if (this.fieldAdditional !== null) {

        this.fieldAdditional = this.fieldRightSidebar['fieldAdditional']['entity'];
        this.fieldAdditionalTitle = this.fieldAdditional['fieldTitle'];
        this.fieldAdditionalBody = this.fieldAdditional['fieldAdditionalBody'];
      }

      if (this.fieldContactSection !== null) {

        this.fieldContactSection = this.fieldRightSidebar['fieldContactSection']['entity'];
        this.fieldContactPerson = this.fieldContactSection['fieldPerson'];
        this.fieldContactPhone = this.fieldContactSection['fieldPhone'];
        this.fieldContactEmail = this.fieldContactSection['fieldEmail'];
        this.fieldContactOrganization = this.fieldContactSection['fieldOrganization'];
      }
    }

  }
  ngOnInit() {

    if ( this.inputData ) {
      this.parseData( this.inputData );
    } else {
      this.route.params.subscribe(
        (params: ActivatedRoute) => {
          this.lang = this.rootScope.get('lang');

          const variables = {
            'path': this.location.path()
          };

          this.content = false;
          this.accordionSection = [];
          this.fieldRightSidebar = false;

          this.querySubscription = this.http.get('getArticle', { params: variables } )
          .subscribe( (response) => {
            this.userLoggedOut = this.user.getData()['isExpired'];
            const data = response['data']['route'];
            if (data) {
              this.parseData( data );
            }
          });
        }
      );
    }

  }

  ngOnDestroy() {
    if ( this.querySubscription ) {
      this.querySubscription.unsubscribe();
    }
  }

  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.rootScope.set('scrollRestorationState', true);
  }
}
