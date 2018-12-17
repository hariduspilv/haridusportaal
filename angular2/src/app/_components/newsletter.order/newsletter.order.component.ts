import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { Modal } from '@app/_components/dialogs/modal/modal';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '@app/_core/settings';

import { HttpService} from '@app/_services/httpService';
import { RootScopeService } from '@app/_services';

@Component({
	selector: 'newsletter-order',
  templateUrl: './newsletter.order.component.html',
  styleUrls: ['./newsletter.order.component.scss']
})

export class NewsletterOrderComponent implements OnInit, OnDestroy{

  subscriptions: Subscription[] = [];

  lang: string;

  data: any;

  formItems: object = {};
  email: string = "";
  errors: object = {};
  rssIDs: string;

  subscriptionSuccessContent: string = "";
  subscribedStatus: boolean = false;
  subscribedFailure: string = "";

  urlPrefix;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private translate: TranslateService,
    private settings: SettingsService,
    private http: HttpService,
    private rootScope: RootScopeService
  ){}

  updateRSSLink() {
    this.rssIDs = '/';

   for( let i in this.formItems ){
     if( this.formItems[i] ){
      if( this.rssIDs !== '/') { this.rssIDs+= ","; }
      this.rssIDs+= i;
      
     }
   }
    
  }
  ngOnInit() {
    this.lang = this.rootScope.get("lang");
    this.urlPrefix = this.settings.url+"/"+this.rootScope.get("lang");
    this.initialize()
  }

  initialize() {
    if( this.route.snapshot.queryParams['confirmsubscription'] ){
      this.subscriptionModal(this.route.snapshot.queryParams['confirmsubscription']);
    }
    else if( this.route.snapshot.queryParams['unsubscribe'] ){
      this.unsubscriptionModal(this.route.snapshot.queryParams['unsubscribe']);
    }

    const paramsSub = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        
        this.data = false;

        let url = "/graphql?queryName=newsletterTags&queryId=87257f778914b18b69ad43bcb1c246e2edee02c1:1&variables=";
        let variables = {
          lang: this.lang.toUpperCase()
        };
        
        let subscribe = this.http.get(url+JSON.stringify(variables)).subscribe( (response) => {
          let data = response['data'];
          this.data = data['CustomTagsQuery']['entities'];
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
    this.initialize()
  }

  submit() {

    this.errors = {};

    let emailRegex = new RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/ig);

    this.errors['email'] = !this.email.match(emailRegex);

    let output = '';

    let counter = 0;
    for( let i in this.formItems ){
      if( !this.formItems[i] ){ continue; }
      output+= output == '' ? i : ", "+i;
      counter++;
    }

    this.errors['items'] = counter > 0 ? false : true;

    let errorCounter = 0;
    for( let i in this.errors ){
      if( this.errors[i] ){
        errorCounter++;
      }
    }

    if( errorCounter > 0 ){
      return false;
    }

    this.data = false;

    let data = {
      queryId: "b6b08eb9a6d99bdfcfb3bf9f980830c2d7d3c3fb:1",
      variables: {
        lang: this.lang.toUpperCase(),
        email: this.email,
        tags: output
      }
    }

    let register = this.http.post('/graphql', data).subscribe((response) => {
      this.subscribedStatus = true;
      register.unsubscribe();
    }, (data) => {
      this.subscribedStatus = true;
      this.subscribedFailure = data;
      register.unsubscribe();
      
    });

    this.subscriptions = [...this.subscriptions];
  }

  subscriptionModal(token:string) {
    
    let dialogRef = this.dialog;

    this.translate.get("newsletter.modal_title").subscribe( (responseData) =>{
      let data = {
        title: this.translate.get("newsletter.modal_title")['value'],
        content: this.translate.get("newsletter.modal_content")['value'],
        close: this.translate.get("newsletter.modal_close")['value']
      };
  
      dialogRef.open(Modal, {
        data: data
      });
      
    });

    let data = { 
      queryId: "884704e2d1dd58c5b9eb3e1c237e46985301d36c:1",
      variables: {
        token: token
      }
    }

    let subscribe = this.http.post('/graphql', data).subscribe((response) => {
      subscribe.unsubscribe();
    });

    this.subscriptions = [...this.subscriptions];
  }

  unsubscriptionModal(token:string) {
    
    let dialogRef = this.dialog;

    this.translate.get("newsletter.unsubscribe_title").subscribe( (responseData) =>{
      let data = {
        title: this.translate.get("newsletter.unsubscribe_title")['value'],
        content: this.translate.get("newsletter.unsubscribe_content")['value'],
        close: this.translate.get("newsletter.modal_close")['value']
      };
  
      dialogRef.open(Modal, {
        data: data
      });
      
    });

    let data = { 
      queryId: "550a90c42d4bb032cab8fd8ff5fb3e3b448c9596:1",
      variables: {
        token: token
      }
    }

    let subscribe = this.http.post('/graphql', data).subscribe((response) => {
      subscribe.unsubscribe();
    });

    this.subscriptions = [...this.subscriptions];
  }

  ngOnDestroy() {
    for( let item of this.subscriptions ) {
      if ( item && item.unsubscribe ) {
        item.unsubscribe();
      }
    }
  }

}

