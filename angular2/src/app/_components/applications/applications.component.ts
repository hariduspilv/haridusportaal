import { Component, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { HttpService } from '@app/_services/httpService';
import { Router, ActivatedRoute } from '@angular/router';
import * as _moment from 'moment';
const moment = _moment;
import { RootScopeService } from '@app/_services/rootScopeService';
import { Subscription } from 'rxjs/Subscription';

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
  public dummyDataVersion: string; //Delete this row after testing is done
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
    let params = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.lang = params['lang'];
      }
    );
    let queryParams = this.route.queryParams.subscribe(
      (strings: ActivatedRoute) => {
        if(strings['version'] != undefined) {
          this.dummyDataVersion = strings['version'];
        } else {
          this.dummyDataVersion = '1';
        }
      }
    );

    this.subscriptions = [...this.subscriptions, queryParams];

    this.subscriptions = [...this.subscriptions, params];
  }

  selectLanguage(obj: object){
    if(obj[this.lang]) return obj[this.lang];
    else return obj['et'];
  }

  compileXjsonLink(form_name){
    if(!form_name) return "";
    return form_name
  }

  sortList(list, method){
    const ACCEPTED = ['title', 'date'];
    if(!list.length || !ACCEPTED.includes(method)) return list;

    let self = this;
    function compareTitle(a,b) {
      if(!a['title'] || !b['title']) return -1;
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
      if(!a['document_date'] || !b['document_date']) return -1;
      return Number(new Date(b.document_date.replace( regex , "$3/$2/$1" ))) - Number(new Date(a.document_date.replace( regex, "$3/$2/$1")));
    }

    if(method === 'title') return list.sort(compareTitle);
    else return list.sort(compareDate);
  }

  formatAcceptableForms(list){
    if(this.acceptable_forms_list_restricted === true){
      return  JSON.parse(JSON.stringify(list)).splice(0, ACCEPTABLE_FORMS_RESTRICTED_LENGTH);
    } else {
     return JSON.parse(JSON.stringify(list));
    }
  }
  
  toggleAcceptableFormsList(){
    this.acceptable_forms_list_restricted = this.acceptable_forms_list_restricted === true ? false : true;
    this.acceptable_forms_list = this.formatAcceptableForms(this.data.acceptable_forms);
  }

  fetchData(){
    let request_boolean = this.loading['initial'] === true ? 1 : 0;
   
    let subscription = this.http.get('/dashboard/applications/'+ request_boolean +'?_format=json').subscribe(response => {

      if(this.loading.initial === true) this.loading.initial = false;
      
      this.data.acceptable_forms = response['acceptable_forms'] || [];
  
      this.data.drafts = response['drafts'] || [];
    
      this.data.documents = response['documents'] || [];
      
      /* DUMMY DATA */
      let dummyData = {
        "1": {
          acceptable_forms: [
            {
              "form_name":"VPT_TAOTLUS",
              "title": {
                "et": "v1_6Vajaduspõhise õppetoetuse taotlus"
              }
            },
            {
              "form_name":"VPT_TAOTLUS",
              "title": {
                "et": "v1_4Vajaduspõhise õppetoetuse taotlus"
              }
            },
            {
              "form_name":"VPT_TAOTLUS",
              "title": {
                "et": "v1_2Vajaduspõhise õppetoetuse taotlus"
              }
            },
            {
              "form_name":"VPT_TAOTLUS",
              "title": {
                "et": "v1_4Vajaduspõhise õppetoetuse taotlus"
              }
            },
            {
              "form_name":"VPT_TAOTLUS",
              "title": {
                "et": "v1_5Vajaduspõhise õppetoetuse taotlus"
              }
            },
            {
              "form_name":"VPT_TAOTLUS",
              "title": {
                "et": "v1_3Vajaduspõhise õppetoetuse taotlus"
              }
            },
            {
              "form_name":"VPT_TAOTLUS",
              "title": {
                "et": "v1_3Vajaduspõhise õppetoetuse taotlus"
              }
            }
          ],
          drafts: [{
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
          }],
          documents: [
            {
              "form_name": "VPT_ESITATUD_TAOTLUS",
              "identifier": 157721,
              "document_date": "11.10.2018",
              "status": "Menetluses",
              "title": {
                "et": "Vajaduspühise õppetoetuse taotlus ja otsus"
              }
            },
            {
              "form_name": "VPT_ESITATUD_TAOTLUS_OTSUS",
              "identifier": 157722,
              "document_date": "11.10.2018",
              "status": "Tagasi lükatud",
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
            }
          ]
        },
        "2": {
          acceptable_forms: [
            {
              "form_name":"VPT_TAOTLUS",
              "title": {
                "et": "v2_6Vajaduspõhise õppetoetuse taotlus"
              }
            },
            {
              "form_name":"VPT_TAOTLUS",
              "title": {
                "et": "v2_4Vajaduspõhise õppetoetuse taotlus"
              }
            },
            {
              "form_name":"VPT_TAOTLUS",
              "title": {
                "et": "v2_2Vajaduspõhise õppetoetuse taotlus"
              }
            },
            {
              "form_name":"VPT_TAOTLUS",
              "title": {
                "et": "v2_4Vajaduspõhise õppetoetuse taotlus"
              }
            },
            {
              "form_name":"VPT_TAOTLUS",
              "title": {
                "et": "v2_5Vajaduspõhise õppetoetuse taotlus"
              }
            },
            {
              "form_name":"VPT_TAOTLUS",
              "title": {
                "et": "v2_3Vajaduspõhise õppetoetuse taotlus"
              }
            },
            {
              "form_name":"VPT_TAOTLUS",
              "title": {
                "et": "v2_3Vajaduspõhise õppetoetuse taotlus"
              }
            }
          ],
          drafts: [{
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
          }],
          documents: [
            {
              "form_name": "VPT_ESITATUD_TAOTLUS",
              "identifier": 157721,
              "document_date": "11.10.2018",
              "status": "Menetluses",
              "title": {
                "et": "Vajaduspühise õppetoetuse taotlus ja otsus"
              }
            },
            {
              "form_name": "VPT_ESITATUD_TAOTLUS_OTSUS",
              "identifier": 157722,
              "document_date": "11.10.2018",
              "status": "Tagasi lükatud",
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
            }
          ]
        }
      }
      this.data.acceptable_forms = dummyData[this.dummyDataVersion].acceptable_forms
      this.data.drafts = dummyData[this.dummyDataVersion].drafts
      this.data.documents = dummyData[this.dummyDataVersion].documents

      /* END OF DUMMY DATA */
      
      this.data.acceptable_forms = this.sortList(this.data.acceptable_forms, 'title');
      this.data.drafts = this.sortList(this.data.drafts, 'title');
      this.data.documents = this.sortList(this.data.documents, 'date');
      
      this.acceptable_forms_list = this.formatAcceptableForms(this.data.acceptable_forms);

      subscription.unsubscribe();

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
