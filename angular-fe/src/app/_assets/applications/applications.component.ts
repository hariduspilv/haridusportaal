import { Component, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as _moment from 'moment';
const moment = _moment;
import { RootScopeService } from '@app/_services/rootScopeService';
import { Subscription } from 'rxjs';
import { TableService, AlertsService } from '@app/_services';
import { UserService } from '@app/_services/userService';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SettingsService } from '@app/_services/SettingsService';
import { JwtHelperService } from '@auth0/angular-jwt';

const acceptableFormsRestrictedLength = 4;
const requestIteratorLifetime = 30;

@Component({
  selector: 'applications',
  templateUrl: './applications.template.html',
  styleUrls: ['./applications.styles.scss'],
})

export class ApplicationsComponent implements OnDestroy, OnInit {
  @Input() jwt;
  public loading = {
    initial: false,
    interval: false,
  };
  public dummyDataVersion: string; // Delete this row after testing is done
  public startTime;
  public endViewCheck: boolean = false;
  public acceptableFormsLimiter = acceptableFormsRestrictedLength;
  public lang: string;
  public pollingLoader: boolean = true;
  public data = {
    message: null,
    acceptable_forms: [],
    documents: [],
    drafts: [],
    educationalInstitutions: [],
  };
  public requestIterator;
  public requestIteratorTimeout = 2000;
  public currentRole: string = '';

  public acceptableFormsList = [];
  public acceptableFormsListRestricted: boolean = true;
  public tableOverflown: any = [{ 0: false, 1: false }];
  public elemAtStart: any = [{ 0: true, 1: true }];
  public initialized: any = [{ 0: false, 1: false }];
  private subscriptions: Subscription[] = [];
  public userData;

  constructor(
    public alertsService: AlertsService,
    public http: HttpClient,
    public rootScope: RootScopeService,
    public route: ActivatedRoute,
    public tableService: TableService,
    public user: UserService,
    public settings: SettingsService,
  ) { }

  pathWatcher() {
    const queryParams = this.route.queryParams.subscribe(
      (strings: ActivatedRoute) => {
        if (strings['version'] !== undefined) {
          this.dummyDataVersion = strings['version'];
        } else {
          this.dummyDataVersion = '1';
        }
      },
    );

    this.subscriptions = [...this.subscriptions, queryParams];
  }

  selectLanguage(obj: object) {
    if (obj[this.lang]) return obj[this.lang];
    return obj['et'];
  }

  compileXjsonLink(formName) {
    if (!formName) return '';
    return formName;
  }

  sortList(list, method) {
    const ACCEPTED = ['title', 'date'];
    if (!list || (list && !list.length) || !ACCEPTED.includes(method)) return list;

    function compareTitle(a, b) {
      if (!a['title'] || !b['title']) return -1;
      const title1 = this.selectLanguage(a['title']).toUpperCase();
      const title2 = this.selectLanguage(b['title']).toUpperCase();
      if (title1 < title2) {
        return -1;
      }
      if (title1 > title2) {
        return 1;
      }
      return 0;
    }

    const regex = /(\d{2}).(\d{2}).(\d{4})/;
    function compareDate(a, b) {
      if (!a['document_date'] || !b['document_date']) return -1;
      return Number(new Date(b.document_date.replace(regex, '$3/$2/$1'))) - Number(new Date(a.document_date.replace(regex, '$3/$2/$1')));
    }

    if (method === 'title') return list.sort(compareTitle);
    return list.sort(compareDate);
  }

  formatAcceptableForms(list) {
    if (this.acceptableFormsListRestricted) {
      return JSON.parse(JSON.stringify(list)).splice(0, acceptableFormsRestrictedLength);
    }

    return JSON.parse(JSON.stringify(list));

  }

  toggleAcceptableFormsList() {
    this.acceptableFormsListRestricted = this.acceptableFormsListRestricted ? false : true;
    this.acceptableFormsList = this.formatAcceptableForms(this.data.acceptable_forms);
  }

  fetchData() {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', "Bearer " + this.jwt);

    setTimeout(() => {
      const subscription = this.http.get(this.settings.url + '/dashboard/applications/1?_format=json', { headers: headers, }).subscribe((response: any) => {
        if (typeof response.found !== undefined && response.found === null) {
          this.fetchData();
        } else {
          if (response['error'] && response['error']['message_text']) {
            this.alertsService.info(response['error']['message_text']['et'], 'general', 'applications', false, false);
          } else if (this.currentRole === 'natural_person') {
            this.data.acceptable_forms = response['acceptable_forms'];
            this.data.drafts = response['drafts'];
            this.data.documents = response['documents'];
            this.data.acceptable_forms = this.sortList(this.data.acceptable_forms, 'title');
            this.data.drafts = this.sortList(this.data.drafts, 'title');
            this.data.documents = this.sortList(this.data.documents, 'date');
            this.acceptableFormsList = this.formatAcceptableForms(this.data.acceptable_forms);
          } else {
            const responseData = response['educationalInstitutions'].map(elem => {
              elem.documents = this.sortList(elem.documents, 'date');
              elem.acceptable_forms = this.sortList(elem.acceptable_forms, 'title');
              elem.drafts = this.sortList(elem.drafts, 'title');
              return elem;
            })
            if (JSON.stringify(this.data.educationalInstitutions) !== JSON.stringify(responseData)) {
              this.data.educationalInstitutions = responseData;
              if (response['message']) {
                this.alertsService.info(response['message'], 'general', 'applications', false, false);
              }
              if (this.data.educationalInstitutions && this.data.educationalInstitutions.length) {
                this.data.educationalInstitutions.forEach((elem, index) => {
                  this.tableOverflown[index] = { 0: false, 1: false, 2: false };
                  this.elemAtStart[index] = { 0: true, 1: true, 2: true };
                  this.initialized[index] = { 0: false, 1: false, 2: false };
                });
              }
            }
          }
          this.loading['initial'] = false;
        }
        subscription.unsubscribe();
      });
    }, 1000);
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
    if (school.institutionInfo.contacts && school.institutionInfo.contacts.contactPhone) counter++;
    if (school.institutionInfo.contacts && school.institutionInfo.contacts.webpageAddress) counter++;
    if (school.institutionInfo.address && school.institutionInfo.address.addressHumanReadable) counter++;
    return counter;
  }

  /*   openDialog(edId, institutionInfo): void {
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
          this.requestIteratorTimeout = 2000;
          this.fetchData(true);
        }
      });
    } */

  ngOnInit() {
    this.jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE1NzEwNTgxMzUsImV4cCI6MTU3MTA2MTczNSwiZHJ1cGFsIjp7InVpZCI6IjY5OSJ9LCJyb2xlIjp7ImN1cnJlbnRfcm9sZSI6eyJ0eXBlIjoibmF0dXJhbF9wZXJzb24ifX0sInVzZXJuYW1lIjoiMzgyMDEyNDAzMTkiLCJmaXJzdG5hbWUiOm51bGwsImxhc3RuYW1lIjpudWxsfQ.PLa7ejw6QG6h5qSdn7DkowLf0xI3h49Fsn8EsCnxGJX85vM_PSvImVepSXuANjLf83Xwzth32ZecPxKCf6OLBQ';
    this.lang = this.rootScope.get('lang');
    this.userData = this.jwt ? this.user.decodeToken(this.jwt) : this.user.getData();
    this.currentRole = this.userData['role']['current_role']['type'];
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
          this.initialTableCheck('juridicalFirst_' + index, index, 0);
          this.initialTableCheck('juridicalSecond_' + index, index, 1);
          this.initialTableCheck('juridicalThird_' + index, index, 2);
        });
        if (document.getElementById('juridicalThird_' + (this.data.educationalInstitutions.length - 1))) {
          this.endViewCheck = true;
        }
      }
    }
  }

  ngOnDestroy() {
    if (this.requestIterator) {
      clearTimeout(this.requestIterator);
    }

    /* Clear all subscriptions */
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
}
