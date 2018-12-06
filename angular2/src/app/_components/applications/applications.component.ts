import { Component, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { HttpService } from '@app/_services/httpService';
import { Router, ActivatedRoute } from '@angular/router';
import * as _moment from 'moment';
const moment = _moment;
import { RootScopeService } from '@app/_services/rootScopeService';
import { Subscription } from 'rxjs/Subscription';
import { TableService } from '@app/_services';
import { UserService } from '@app/_services/userService';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DashboardFormDialog } from '@app/_components/dialogs/dashboard.form/dashboard.form.dialog';

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
  public endViewCheck: boolean = false;
  public acceptableFormsLimiter = ACCEPTABLE_FORMS_RESTRICTED_LENGTH;
  public lang: string;
  public pollingLoader: boolean = true;
  public data = {
    message: null,
    acceptable_forms: [],
    documents: [],
    drafts: [],
    educationalInstitutions: []
  };
  public request_iterator;
  public request_iterator_timeout = 2000;
  public userData: any;
  public currentRole: string = '';

  public acceptable_forms_list = [];
  public acceptable_forms_list_restricted: boolean = true;
  public tableOverflown: any = [{0: false, 1: false}];
  public elemAtStart: any = [{0: true, 1: true}];
  public initialized: any = [{0: false, 1: false}];
  private subscriptions: Subscription[] = [];


  constructor(public http: HttpService,
    public dialog: MatDialog,
    public rootScope: RootScopeService,
    public route: ActivatedRoute,
    public tableService: TableService,
    public user: UserService) {}

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

  fetchData(update){
    let request_boolean = this.loading['initial'] === true ? 1 : 0;
   
    let subscription = this.http.get('/dashboard/applications/'+ request_boolean +'?_format=json').subscribe(response => {
      if (this.currentRole === 'natural_person') {
        this.data.acceptable_forms = response['acceptable_forms']; 
        // dummyData[this.dummyDataVersion].acceptable_forms || 
        this.data.drafts = response['drafts'];
        // dummyData[this.dummyDataVersion].drafts || 
        this.data.documents = response['documents'];
        // dummyData[this.dummyDataVersion].documents ||
        this.data.acceptable_forms = this.sortList(this.data.acceptable_forms, 'title');
        this.data.drafts = this.sortList(this.data.drafts, 'title');
        this.data.documents = this.sortList(this.data.documents, 'date');
        
        this.acceptable_forms_list = this.formatAcceptableForms(this.data.acceptable_forms); 
      } else {
        if (JSON.stringify(this.data.educationalInstitutions) !== JSON.stringify(response['educationalInstitutions'])) {
          this.data.educationalInstitutions = response['educationalInstitutions']; 
          // && response['educationalInstitutions'].length ? response['educationalInstitutions'] : juridicalDummyData[this.dummyDataVersion].educationalInstitutions;
          this.data.message = response['message'];
          // || juridicalDummyData[this.dummyDataVersion].message;
          // this.data.educationalInstitutions = juridicalDummyData[this.dummyDataVersion].educationalInstitutions;
          // this.data.message = juridicalDummyData[this.dummyDataVersion].message || response['message'];
          if (this.data.educationalInstitutions && this.data.educationalInstitutions.length) {
            this.data.educationalInstitutions.forEach((elem, index) => {
              this.tableOverflown[index] = {0: false, 1: false, 2: false};
              this.elemAtStart[index] = {0: true, 1: true, 2: true};
              this.initialized[index] = {0: false, 1: false, 2: false};
            })
          }
        }
      }
      
      if (this.loading.initial === true && !update) {
        this.loading.initial = false;
      }
      subscription.unsubscribe();

      if((Date.now() - this.startTime)/1000 < REQUEST_ITERATOR_LIFETIME ){
        this.request_iterator_timeout += (0.25 * this.request_iterator_timeout);
        this.loading['interval'] = true;
        let self = this;
        this.request_iterator = setTimeout(() => {
          self.fetchData(false);
        }, this.request_iterator_timeout);
      } else {
        this.loading['interval'] = false;
      }
     
    });
  }

  initialTableCheck(id, parentIndex, index) {
    const element = document.getElementById(id);
    if (element) {
      this.tableOverflown[parentIndex][index] = (element.scrollWidth - element.scrollLeft) > element.clientWidth;
      this.initialized[parentIndex][index] = true;
    }
  }

  institutionInfoFieldSum(school) {
    let counter = 0;
    if (school.institutionInfo.contacts && school.institutionInfo.contacts.contactEmail) counter++;
    if (school.institutionInfo.contacts &&school.institutionInfo.contacts.contactPhone) counter++;
    if (school.institutionInfo.contacts && school.institutionInfo.contacts.webpageAddress) counter++; 
    if (school.institutionInfo.address && school.institutionInfo.address.addressHumanReadable) counter++;
    return counter;
  }

  openDialog(edId, institutionInfo): void {
		let dialogRef = this.dialog.open(DashboardFormDialog, {
		  data: {
        edId,
        institutionInfo
      }
    });
		
		dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.startTime = Date.now();
        this.loading['initial'] = true;
        this.request_iterator_timeout = 2000;
        this.fetchData(true);
      }
		});
	}

  ngOnInit(){
    this.userData = this.user.getData();
    this.currentRole = this.userData['role']['current_role']['type'];
    this.setPaths();
    this.pathWatcher();
    this.startTime = Date.now();
    this.loading['initial'] = true;
    this.fetchData(false);
  }
  
  ngAfterViewChecked() {
    if (!this.endViewCheck) {
      this.initialTableCheck('table_0', 0, 0);
      this.initialTableCheck('table_1', 0, 1);
      if (this.data.educationalInstitutions && this.data.educationalInstitutions.length) {
        this.data.educationalInstitutions.forEach((elem, index) => {
          this.initialTableCheck('juridicalFirst_'+index, index, 0);
          this.initialTableCheck('juridicalSecond_'+index, index, 1);
          this.initialTableCheck('juridicalThird_'+index, index, 2);
        });
        if (document.getElementById('juridicalThird_'+(this.data.educationalInstitutions.length - 1))) {
          this.endViewCheck = true;
        }
      }
    }
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
