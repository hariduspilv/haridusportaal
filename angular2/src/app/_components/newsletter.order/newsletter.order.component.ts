import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { Modal } from '@app/_components/dialogs/modal/modal';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '@app/_services/settings.service';

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

        let url = "newsletterTags";
        let variables = {
          lang: this.lang.toUpperCase()
        };
        
        let subscribe = this.http.get('newsletterTags', { params: variables } ).subscribe( (response) => {
          let data = response['data'];
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
    this.initialize()
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
  scrollElementIntoView(element){ 
    try { 
      element.scrollIntoView(true); 
    } catch(er) { 

      let T= 0; 
      let reference = element; 
      while(reference.parentNode) { 
        T += (reference.offsetTop)? reference.offsetTop: 0; 
        if(reference == document.body) break; 
        reference = reference.parentNode; 
      } 
      window.scrollTo(0,T);
    } 
    try { 
      element.focus(); 
    } catch(er){ 
      return true 
    } 
  }

  submit() {

    this.errors = {};

    let emailRegex = new RegExp(/[^@\s]+@[^@\s]+\.[^@\s][^@\s]+/gm);

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

    let element = document.getElementById('blockTop');
    this.scrollElementIntoView(element);

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