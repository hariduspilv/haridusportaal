import { Component, OnInit, OnDestroy } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { getTags, signup, activate, deactivate } from '@app/_graph/newsletter.graph';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { Modal } from '@app/_components/dialogs/modal/modal';
import { TranslateService } from '@ngx-translate/core';

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

  constructor(
    private apollo: Apollo,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private translate: TranslateService
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

        this.lang = params['lang'];

        const tagSubscription = this.apollo.watchQuery({
          query: getTags,
          variables: {
            lang: this.lang.toUpperCase(),
          },
          fetchPolicy: 'no-cache',
          errorPolicy: 'all'
        })
        .valueChanges
        .subscribe(({data}) => {
          this.data = data['CustomTagsQuery']['entities'];
        });

        this.subscriptions = [...this.subscriptions, tagSubscription];

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
    
    const tagsSignup = this.apollo.mutate({
      mutation: signup,
      variables: {
        lang: this.lang.toUpperCase(),
        email: this.email,
        tags: output
      },
      fetchPolicy: 'no-cache',
      errorPolicy: 'all'
    })
    .subscribe(({data}) => {
      this.subscribedStatus = true;
    }, (data) => {
      this.subscribedStatus = true;
      this.subscribedFailure = data;
    });
    this.subscriptions = [...this.subscriptions, tagsSignup];
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

    const subscribe = this.apollo.mutate({
      mutation: activate,
      variables: {
        token: token
      },
      fetchPolicy: 'no-cache',
      errorPolicy: 'all'
    }).subscribe();
    this.subscriptions = [...this.subscriptions, subscribe];
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

    const unsubscribe = this.apollo.mutate({
      mutation: deactivate,
      variables: {
        token: token,
      },
      fetchPolicy: 'no-cache',
      errorPolicy: 'all'
    }).subscribe();
    this.subscriptions = [...this.subscriptions, unsubscribe];
  }

  ngOnDestroy() {
    for( let item of this.subscriptions ) {
      if ( item && item.unsubscribe ) {
        item.unsubscribe();
      }
    }
  }

}

