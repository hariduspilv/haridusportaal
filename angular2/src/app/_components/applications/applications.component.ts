import { Component, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { HttpService } from '@app/_services/httpService';
import { Router } from '@angular/router';
import * as _moment from 'moment';
const moment = _moment;

const ACCEPTABLE_FORMS_RESTRICTED_LENGTH = 4;
const REQUEST_ITERATOR_LIFETIME = 30;
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
  public lang: string = 'et';
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
  constructor(public http: HttpService) {}

  selectLanguage(obj: object){
    if(obj[this.lang]) return obj[this.lang];
    else return obj['et'];
  }
  compileXjsonLink(form_name){
    return '/'+ this.lang +'/xjson/' + form_name;
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

    let _this = this;
    function compareTitle(a,b) {
      let title1 = _this.selectLanguage(a['title']).toUpperCase();
      let title2 = _this.selectLanguage(b['title']).toUpperCase();
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
    
    var _this = this;
   
    let subscription = this.http.get('/dashboard/applications/'+ request_boolean +'?_format=json').subscribe(response => {

      if(this.loading.initial === true) this.loading.initial = false;
      
      this.data.acceptable_forms = response['acceptable_forms'] || [];
  
      this.data.drafts = response['drafts'] || [];
    
      this.data.documents = response['documents'] || [];

      /* DUMMY DATA */
      this.data.acceptable_forms = [
        {
          "form_name":"VPT_TAOTLUS",
          "title": {
            "et": "6Vajaduspõhise õppetoetuse taotlus"
          }
        },
        {
          "form_name":"VPT_TAOTLUS",
          "title": {
            "et": "4Vajaduspõhise õppetoetuse taotlus"
          }
        },
        {
          "form_name":"VPT_TAOTLUS",
          "title": {
            "et": "2Vajaduspõhise õppetoetuse taotlus"
          }
        },
        {
          "form_name":"VPT_TAOTLUS",
          "title": {
            "et": "1Vajaduspõhise õppetoetuse taotlus"
          }
        },
        {
          "form_name":"VPT_TAOTLUS",
          "title": {
            "et": "5Vajaduspõhise õppetoetuse taotlus"
          }
        },
        {
          "form_name":"VPT_TAOTLUS",
          "title": {
            "et": "3Vajaduspõhise õppetoetuse taotlus"
          }
        }
      ];
      
      this.data.drafts = [{
        "form_name": "VPT_ESITATUD_TAOTLUS_OTSUS",
          "identifier": 157707,
          "document_date": "17.09.2018",
          "status": "Heaks kiidetud",
          "title": {
            "et": "4Vajaduspühise õppetoetuse taotlus ja otsus"
          }
        },
        {
          "form_name": "VPT_ESITATUD_TAOTLUS_OTSUS",
          "identifier": 157707,
          "document_date": "17.09.2018",
          "status": "Heaks kiidetud",
          "title": {
            "et": "2Vajaduspühise õppetoetuse taotlus ja otsus"
          }
        },
        {
          "form_name": "VPT_ESITATUD_TAOTLUS_OTSUS",
          "identifier": 157707,
          "document_date": "17.09.2018",
          "status": "Heaks kiidetud",
          "title": {
            "et": "1Vajaduspühise õppetoetuse taotlus ja otsus"
          }
        }];

      this.data.documents = [
        {
          "form_name": "VPT_ESITATUD_TAOTLUS_OTSUS",
          "identifier": 157707,
          "document_date": "05.10.2017",
          "status": "Esitatud",
          "title": {
            "et": "Vajaduspühise õppetoetuse taotlus ja otsus"
          }
        },
        {
          "form_name": "VPT_ESITATUD_TAOTLUS_OTSUS",
          "identifier": 157707,
          "document_date": "17.09.2018",
          "status": "Heaks kiidetud",
          "title": {
            "et": "Vajaduspühise õppetoetuse taotlus ja otsus"
          }
        },
        {
          "form_name": "VPT_ESITATUD_TAOTLUS_OTSUS2",
          "identifier": 157707,
          "document_date": "20.09.2018",
          "description": "lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum ",
          "status": "Heaks kiidetud",
          "title": {
            "et": "Vajaduspühise õppetoetuse taotlus ja otsus"
          }
        },
        {
          "form_name": "VPT_ESITATUD_TAOTLUS_OTSUS",
          "identifier": 157707,
          "document_date": "01.04.2017",
          "status": "Esitatud",
          "title": {
            "et": "Vajaduspühise õppetoetuse taotlus ja otsus"
          }
        }
      ];
      /* END OF DUMMY DATA */
      
      this.data.acceptable_forms = this.sortList(this.data.acceptable_forms, 'title');
      this.data.drafts = this.sortList(this.data.drafts, 'title');
      this.data.documents = this.sortList(this.data.documents, 'date');

      this.formatAcceptableForms();

      subscription.unsubscribe();
      //console.log(response);

      if((Date.now() - this.startTime)/1000 < REQUEST_ITERATOR_LIFETIME ){
        this.request_iterator_timeout += (0.25 * this.request_iterator_timeout);
        this.loading['interval'] = true;
        this.request_iterator = setTimeout(() => {
          //console.log((Date.now() - _this.startTime)/1000);
          _this.fetchData();
        }, _this.request_iterator_timeout);
      } else {
        this.loading['interval'] = false;
      }
     
    });
  }

  ngOnInit(){
    this.startTime = Date.now();
    this.loading['initial'] = true;
    this.fetchData()
  }
  ngOnDestroy(){
    if(this.request_iterator){
      clearTimeout(this.request_iterator);
    }
  }
  
}
