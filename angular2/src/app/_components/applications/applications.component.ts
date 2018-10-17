import { Component, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { HttpService } from '@app/_services/httpService';
import { Router, ActivatedRoute } from '@angular/router';
import * as _moment from 'moment';
const moment = _moment;
import { RootScopeService } from '@app/_services/rootScopeService';
import { Subscription } from 'rxjs/Subscription';

const ACCEPTABLE_FORMS_RESTRICTED_LENGTH = 4;
const REQUEST_ITERATOR_LIFETIME = 0;

@Component({
  selector: 'applications',
  templateUrl: './applications.template.html',
  styleUrls: ['../certificates/certificates.styles.scss']
})

export class ApplicationsComponent implements OnInit, OnDestroy{
  public loading = {
    initial: false,
    interval: false
  };
  public startTime;
  public lang: string;
  public pollingLoader: boolean = true;
  public data = {
    acceptable_forms: [],
    documents: [],
    drafts: []
  };
  public request_iterator;
  public request_iterator_timeout = 2000;

  public acceptable_forms_list = [];
  public acceptable_forms_list_restricted: boolean = true;

  private subscriptions: Subscription[] = [];


  constructor(public http: HttpService,
    public rootScope: RootScopeService,
    public route: ActivatedRoute) {}

  setPaths() {
    this.rootScope.set('langOptions', {
      'en': '/en/dashboard/applications',
      'et': '/et/toolaud/taotlused'
    });
  }

  pathWatcher() { 
    let subscribe = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.lang = params['lang'];
      }
    );

    this.subscriptions = [...this.subscriptions, subscribe];
  }

  selectLanguage(obj: object){
    if(obj[this.lang]) return obj[this.lang];
    else return obj['et'];
  }

  compileXjsonLink(form_name){
    return form_name
  }

  acceptableFormsLoader(){
    if(this.acceptable_forms_list.length < 4 && this.loading.interval)
      return true;
    if(this.acceptable_forms_list.length > 4 && this.acceptable_forms_list_restricted == false && this.loading.interval)
      return true;
    return false
  }

  sortList(list, method){
    const ACCEPTED = ['title', 'date'];
    if(!list.length || !ACCEPTED.includes(method)) return list;

    let self = this;
    function compareTitle(a,b) {
      let title1 = self.selectLanguage(a['title']).toUpperCase();
      let title2 = self.selectLanguage(b['title']).toUpperCase();
      if (title1 < title2)
        return -1;
      if (title1 > title2)
        return 1;
      return 0;
    }

    let regex = /(\d{2}).(\d{2}).(\d{4})/;
    function compareDate(a,b){
      return Number(new Date(b.document_date.replace( regex , "$3/$2/$1" ))) - Number(new Date(a.document_date.replace( regex, "$3/$2/$1")));
    }

    if(method === 'title') return list.sort(compareTitle);
    else return list.sort(compareDate);
  }

  formatAcceptableForms(){
    if(this.acceptable_forms_list_restricted === true){
      this.acceptable_forms_list = JSON.parse(JSON.stringify(this.data.acceptable_forms)).splice(0, ACCEPTABLE_FORMS_RESTRICTED_LENGTH);
    } else {
      this.acceptable_forms_list = JSON.parse(JSON.stringify(this.data.acceptable_forms));
    }
  }
  
  fetchData(){
    let request_boolean = this.loading['initial'] === true ? 1 : 0;
   
    let subscription = this.http.get('/dashboard/applications/'+ request_boolean +'?_format=json').subscribe(response => {

      if(this.loading.initial === true) this.loading.initial = false;
      
      this.data.acceptable_forms = response['acceptable_forms'] || [];
  
      this.data.drafts = response['drafts'] || [];
    
      this.data.documents = response['documents'] || [];

      
      
      this.data.acceptable_forms = this.sortList(this.data.acceptable_forms, 'title');
      this.data.drafts = this.sortList(this.data.drafts, 'title');
      this.data.documents = this.sortList(this.data.documents, 'date');

      this.formatAcceptableForms();

      subscription.unsubscribe();
      //console.log(response);

      if((Date.now() - this.startTime)/1000 < REQUEST_ITERATOR_LIFETIME ){
        this.request_iterator_timeout += (0.25 * this.request_iterator_timeout);
        this.loading['interval'] = true;
        let self = this;
        this.request_iterator = setTimeout(() => {
          self.fetchData();
        }, this.request_iterator_timeout);
      } else {
        this.loading['interval'] = false;
      }
     
    });
  }

  ngOnInit(){
    this.setPaths();
    this.pathWatcher();
    this.startTime = Date.now();
    this.loading['initial'] = true;
    this.fetchData();
  }
  ngOnDestroy(){
    if(this.request_iterator){
      clearTimeout(this.request_iterator);
    }
    
    /* Clear all subscriptions */
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
  
}
