import { Component, OnInit, OnDestroy } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { getTags, signup, activate, deactivate } from '../../_services/newsletter/newsletter.graph';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { Modal } from '../dialogs/modal/modal';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'newsletter-order',
  templateUrl: './newsletter.order.component.html',
  
})

export class NewsletterOrderComponent implements OnInit, OnDestroy{

  subscriptions: Subscription[] = [];

  lang: string;

  data: any;

  formItems: object = {};
  email: string = "";
  errors: object = {};

  subscribedStatus: boolean = false;

  constructor(
    private apollo: Apollo,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private translate: TranslateService
  ){}

  ngOnInit() {

    console.log(this.route.snapshot.queryParams);
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
            fetchPolicy: 'no-cache',
            errorPolicy: 'all'
          },
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
        tags: output,
        fetchPolicy: 'no-cache',
        errorPolicy: 'all'
      },
    })
    .subscribe(({data}) => {
      this.subscribedStatus = true;
    });
    this.subscriptions = [...this.subscriptions, tagsSignup];
  }

  subscriptionModal(token:string) {
    
    let dialogRef = this.dialog;

    this.translate.get("newsletter.modal.title").subscribe( (responseData) =>{
      let data = {
        title: this.translate.get("newsletter.modal.title")['value'],
        content: this.translate.get("newsletter.modal.content")['value'],
        close: this.translate.get("newsletter.modal.close")['value']
      };
  
      dialogRef.open(Modal, {
        data: data
      });
      
    });

    const subscribe = this.apollo.mutate({
      mutation: activate,
      variables: {
        token: token,
        fetchPolicy: 'no-cache',
        errorPolicy: 'all'
      },
    })
    .subscribe(({data}) => {
      console.log(data);
    });
    this.subscriptions = [...this.subscriptions, subscribe];
  }

  unsubscriptionModal(token:string) {
    
    let dialogRef = this.dialog;

    this.translate.get("newsletter.unsubscribe.title").subscribe( (responseData) =>{
      let data = {
        title: this.translate.get("newsletter.unsubscribe.title")['value'],
        content: this.translate.get("newsletter.unsubscribe.content")['value'],
        close: this.translate.get("newsletter.modal.close")['value']
      };
  
      dialogRef.open(Modal, {
        data: data
      });
      
    });

    const unsubscribe = this.apollo.mutate({
      mutation: deactivate,
      variables: {
        token: token,
        fetchPolicy: 'no-cache',
        errorPolicy: 'all'
      },
    })
    .subscribe(({data}) => {
      console.log(data);
    });
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

