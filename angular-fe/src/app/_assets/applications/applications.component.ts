import { Component, OnInit, Input, Output, OnDestroy, ChangeDetectorRef, ViewRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as _moment from 'moment';
const moment = _moment;
import { RootScopeService } from '@app/_services/RootScopeService';
import { Subscription } from 'rxjs';
import { AlertsService, ModalService, AuthService, SettingsService, Alert, AlertType } from '@app/_services';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TableService } from '@app/_services/tableService';
import { formItems } from '../../../../stories/assets/formItem/formItem.data';
import { FormControl, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { NgbRadio } from '@ng-bootstrap/ng-bootstrap';

const acceptableFormsRestrictedLength = 4;

@Component({
  selector: 'applications',
  templateUrl: './applications.template.html',
  styleUrls: ['./applications.styles.scss'],
})

export class ApplicationsComponent implements OnDestroy, OnInit {
  loading = {
    initial: false,
    interval: false,
  };

  public requestCounter: number = 0;
  public maxRequests: number = 10;
  public requestError: boolean = false;

  private debounce;
  private delay: number = 200;

  dummyDataVersion: string;
  startTime;
  endViewCheck: boolean = false;
  acceptableFormsLimiter = acceptableFormsRestrictedLength;
  lang: string;
  pollingLoader: boolean = true;
  data = {
    message: null,
    acceptable_forms: [],
    documents: [],
    drafts: [],
    educationalInstitutions: [],
  };
  createdMessage = {};
  requestIterator;
  requestIteratorTimeout = 1000;
  currentRole: string = '';

  institutionData = [];
  editableInstitution = {};
  editableId = '';

  modalTitleExists = true;
  modalTopAction = false;
  modalBottomAction = true;
  institutionModalFields = [];
  viewReload = false;

  acceptableFormsList = [];
  acceptableFormsListRestricted: boolean = true;
  tableOverflown: any = [{ 0: false, 1: false }];
  elemAtStart: any = [{ 0: true, 1: true }];
  initialized: any = [{ 0: false, 1: false }];
  private subscriptions: Subscription[] = [];
  private locSubscriptions: Subscription[] = [];
  userData;
  error = false;
  modalLoading = false;
  formOptions = {
    ownerType: [],
    ownershipType: [],
    studyInstitutionType: [],
  };

  public formGroup: FormGroup = this.formBuilder.group({});

  constructor(
    public alertsService: AlertsService,
    public http: HttpClient,
    public route: ActivatedRoute,
    public tableService: TableService,
    public auth: AuthService,
    public settings: SettingsService,
    public modalService: ModalService,
    public formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef,
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

  compileXjsonLink(formName: any) {
    if (!formName) return '';
    return `taotlused/${formName}`;
  }

  sortList(list: any, method: any) {
    const ACCEPTED = ['title', 'date'];
    if (!list || (list && !list.length) || !ACCEPTED.includes(method)) return list;

    const compareTitle = (a, b) => {
      if (!a['title'] || !b['title']) return -1;
      const title1 = a.title.et.toUpperCase();
      const title2 = b.title.et.toUpperCase();
      if (title1 < title2) {
        return -1;
      }
      if (title1 > title2) {
        return 1;
      }
      return 0;
    };

    const regex = /(\d{2}).(\d{2}).(\d{4})/;
    function compareDate(a: any, b: any) {
      if (!a['document_date'] || !b['document_date']) return -1;
      // tslint:disable-next-line: max-line-length
      return Number(new Date(b.document_date.replace(regex, '$3/$2/$1'))) - Number(new Date(a.document_date.replace(regex, '$3/$2/$1')));
    }

    if (method === 'title') return list.sort(compareTitle);
    return list.sort(compareDate);
  }

  isNumber(item) {
    return !isNaN(item);
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

  createMessage(school) {
    this.alertsService.info(school.message, String(school.id), false);
    this.createdMessage[school.id] = true;
  }

  toString(item) {
    return String(item);
  }

  filterForms(elem, newProperty, forms) {
    Object.entries(elem).map(([key, val]) => {
      if (Array.isArray(val)) {
        const filteredValues = val.filter(i => forms.indexOf(i.form_name));
      }
    });
  }

  tryAgain(): void {
    this.requestError = false;
    this.requestCounter = 0;
    this.loading.initial = true;
    this.fetchData(true);
  }

  requestFailed(): void {
    this.requestError = true;
    this.loading.initial = false;
    setTimeout(
      () => {
        this.alertsService.notify(
          new Alert({
            message: 'Ei saanud EHIS-ga ühendust!',
            type: AlertType.Error,
            id: 'requestAlert',
            category: 'requestAlert',
            closeable: false,
          }),
        );
      },
      0);
  }

  fetchData(init = true) {
    const delay = init ? 0 : this.requestIteratorTimeout;

    this.requestCounter = this.requestCounter + 1;

    setTimeout(
      () => {
        const subscription = this.http
          .get(`${this.settings.url}/dashboard/applications/${init ? '1' : '0'}?_format=json`)
          .subscribe(
            (response: any) => {
              if (typeof response.found !== undefined && response.found === null) {
                if (this.requestCounter < this.maxRequests) {
                  this.fetchData(false);
                } else {
                  this.requestFailed();
                }
              } else {
                this.requestCounter = 0;
                if (response.error && response.error.message_text) {
                  this.alertsService
                    .info(response.error.message_text.et, 'general', 'applications', false, false);
                } else if (this.currentRole === 'natural_person') {
                  this.data.acceptable_forms = response['acceptable_forms'];
                  this.data.drafts = response['drafts'];
                  this.data.documents = response['documents'];
                  this.data.acceptable_forms = this.sortList(this.data.acceptable_forms, 'title');
                  this.data.drafts = this.sortList(this.data.drafts, 'title');
                  this.data.documents = this.sortList(this.data.documents, 'date');
                  this.acceptableFormsList = this.formatAcceptableForms(this.data.acceptable_forms);
                } else {
                  if (response['educationalInstitutions']) {
                    const responseData = response['educationalInstitutions'].map((elem) => {
                      elem.documents = this.sortList(elem.documents, 'date');
                      this.alertsService.info(elem.message, String(elem.id), false);
                      return elem;
                    });
                    if (
                      JSON.stringify(this.data.educationalInstitutions)
                      !== JSON.stringify(responseData)
                    ) {
                      this.data.educationalInstitutions = responseData;
                      if (response['message']) {
                        this.alertsService
                          .info(response.message, 'general', 'applications', false, false);
                      }
                      if (
                        this.data.educationalInstitutions
                        && this.data.educationalInstitutions.length
                      ) {
                        this.data.educationalInstitutions.forEach((elem, index) => {
                          this.tableOverflown[index] = { 0: false, 1: false, 2: false };
                          this.elemAtStart[index] = { 0: true, 1: true, 2: true };
                          this.initialized[index] = { 0: false, 1: false, 2: false };
                        });
                      }
                    }

                    this.data.educationalInstitutions.forEach((school, ind) => {
                      if (school.institutionInfo.address.addressFull === null) {
                        this.getInAds(school);
                      }
                    });
                  }
                }
                this.loading.initial = false;
              }
              subscription.unsubscribe();
            });
      },
      delay);
  }

  initialTableCheck(id: any, parentIndex: any, index: any) {
    const element = document.getElementById(id);
    if (element) {
      this.tableOverflown[parentIndex][index]
        = (element.scrollWidth - element.scrollLeft) > element.clientWidth;
      this.initialized[parentIndex][index] = true;
    }
  }

  institutionInfoFieldSum(school) {
    let counter = 0;
    // tslint:disable-next-line: max-line-length
    if (school.institutionInfo.contacts && school.institutionInfo.contacts.contactEmail) counter += 1;
    // tslint:disable-next-line: max-line-length
    if (school.institutionInfo.contacts && school.institutionInfo.contacts.contactPhone) counter += 1;
    // tslint:disable-next-line: max-line-length
    if (school.institutionInfo.contacts && school.institutionInfo.contacts.webpageAddress) counter += 1;
    // tslint:disable-next-line: max-line-length
    if (school.institutionInfo.address && school.institutionInfo.address.addressHumanReadable) counter += 1;
    return counter;
  }

  loadInstitutionModal(id = null, editableInst = false) {
    this.editableInstitution = editableInst ? editableInst : {};
    this.editableId = id;
    this.alertsService.clear('institution');
    this.modalBottomAction = false;
    this.formGroup = this.formBuilder.group({});
    if (!editableInst) {
      this.institutionModalFields = [
        {
          col: 12,
          type: 'text',
          title: 'school.institution_name',
          modelName: 'name',
          required: true,
          error: false,
          formControl: this.formBuilder.control('', Validators.required),
        },
        {
          col: 12,
          type: 'text',
          title: 'dashboard.nameENG',
          modelName: 'nameENG',
          required: false,
          error: false,
          formControl: this.formBuilder.control(''),
        },
        {
          col: 6,
          type: 'text',
          title: 'dashboard.contactPhone',
          modelName: 'contactPhone',
          required: true,
          error: false,
          formControl: this.formBuilder.control('', Validators.required),
        },
        {
          col: 6,
          type: 'text',
          title: 'event.participant_email',
          modelName: 'contactEmail',
          required: true,
          error: false,
          formControl: this.formBuilder.control('', Validators.required),
        },
        {
          col: 12,
          type: 'autocomplete',
          query: 'inaadress',
          title: 'dashboard.address',
          modelName: 'address',
          required: true,
          error: false,
          formControl: this.formBuilder.control('', Validators.required),
        },
        {
          col: 6,
          type: 'text',
          title: 'dashboard.webpageAddress',
          modelName: 'webpageAddress',
          required: true,
          error: false,
          formControl: this.formBuilder.control('', Validators.required),
        },
        {
          col: 6,
          type: 'select',
          title: 'dashboard.ownerType',
          modelName: 'ownerType',
          options: [],
          required: true,
          error: false,
          formControl: this.formBuilder.control('', Validators.required),
        },
        {
          col: 6,
          type: 'select',
          title: 'school.ownership',
          modelName: 'ownershipType',
          options: [],
          required: true,
          error: false,
          formControl: this.formBuilder.control('', Validators.required),
        },
        {
          col: 6,
          type: 'select',
          title: 'dashboard.studyInstitutionType',
          modelName: 'studyInstitutionType',
          options: [],
          required: true,
          error: false,
          formControl: this.formBuilder.control('', Validators.required),
        },
      ];
    } else {
      this.institutionModalFields = [
        {
          col: 12,
          type: 'text',
          title: 'dashboard.contactPhone',
          modelCategory: 'contacts',
          modelName: 'contactPhone',
          required: false,
          error: false,
          formControl: this.formBuilder.control(''),
        },
        {
          col: 12,
          type: 'text',
          title: 'event.participant_email',
          modelCategory: 'contacts',
          modelName: 'contactEmail',
          required: false,
          error: false,
          formControl: this.formBuilder.control(''),
        },
        {
          col: 12,
          type: 'text',
          title: 'dashboard.webpageAddress',
          modelCategory: 'contacts',
          modelName: 'webpageAddress',
          required: false,
          error: false,
          formControl: this.formBuilder.control(''),
        },
        {
          col: 12,
          type: 'autocomplete',
          query: 'inaadress',
          title: 'dashboard.address',
          modelCategory: false,
          modelName: 'address',
          required: true,
          error: false,
          formControl: this.formBuilder.control('', Validators.required),
        },
      ];
    }

    this.institutionModalFields.forEach((el) => {
      this.formGroup.addControl(el.modelName, el.formControl);
    });
    this.formGroup.updateValueAndValidity();
    this.error = false;
    this.modalLoading = true;
    editableInst ? this.modalService.toggle('editInstitutionModal') :
      this.modalService.toggle('institutionModal');
    const sub = this.http
      .get(`${this.settings.url}/educational-institution/data?_format=json`)
      .subscribe((response: any) => {

        Object.keys(this.formOptions).forEach((key) => {
          Object.values(response[key]).forEach((elem: any, index) => {
            elem['id'] = Object.keys(response[key])[index];
            this.formOptions[key].push({ key: elem.et, value: elem.id });
          });
        });

        this.institutionModalFields.forEach((item) => {
          const value = item.modelCategory ?
            this.editableInstitution[item.modelCategory][item.modelName] :
            this.editableInstitution[item.modelName];
          item.formControl.setValue(value);
          if (item.query === 'inaadress') {
            this.getItemAddress(item);
          }
        });
        this.modalLoading = false;
        sub.unsubscribe();
      });

  }

  getItemAddress(item) {
    if (item.formControl.value && item.formControl.value.addressHumanReadable) {
      const address = item.formControl.value.addressHumanReadable;
      const params = `ihist=1&appartment=1&address=${address}&results=10&callback=JSONP_CALLBACK`;
      const path = `https://inaadress.maaamet.ee/inaadress/gazetteer?${params}`;
      const subscription = this.http.jsonp(path, 'callback').
        subscribe((response: any) => {
          const value = { ...response.addresses[0] };
          item.formControl.setValue(value);
        });
    }
  }

  getWebPage(url) {
    return url.startsWith('www.') ? `http://${url}` : url;
  }

  getInAds(school) {
    const id = school.institutionInfo.address.adsOid;
    const params = `ihist=1&appartment=1&address=${id}&results=10&callback=JSONP_CALLBACK`;
    const path = `https://inaadress.maaamet.ee/inaadress/gazetteer?${params}`;
    school.institutionInfo.address.addressFull = '';
    const subscription = this.http.jsonp(path, 'callback').
      subscribe((response: any) => {
        school.institutionInfo.address.addressFull =
          response.addresses && response.addresses[0] && response.addresses[0].pikkaadress ?
            response.addresses[0].pikkaadress :
            school.institutionInfo.address.addressHumanReadable;

        if (this.cdr && !(this.cdr as ViewRef).destroyed) {
          this.cdr.detectChanges();
        }
        subscription.unsubscribe();
      });
  }

  editInstitution() {
    this.error = false;
    this.modalLoading = true;
    if (!this.formGroup.valid) {
      Object.entries(this.formGroup.controls).map(([key, val]) => {
        const seq = Object.keys(this.formGroup.controls).indexOf(key);
        this.institutionModalFields[seq].error = val.errors ? true : false;
      });
      this.modalLoading = false;
    } else {
      const body = {
        edId: this.editableId,
        address: this.formGroup.value.address,
        contacts: {
          contactPhone: this.formGroup.value.contactPhone,
          contactEmail: this.formGroup.value.contactEmail,
          webpageAddress: this.formGroup.value.webpageAddress,
        },
      };

      const sub = this.http
        .post(`${this.settings.url}/educational-institution/edit`, body)
        .subscribe(
          (response: any) => {
            this.alertsService.info(response.message, 'institution', 'institution', false, false);
            this.modalLoading = false;
            this.modalBottomAction = true;
            this.editableInstitution = body;
            this.viewReload = true;
            this.modalService.close('editInstitutionModal');
            this.loading.initial = true;
            this.fetchData(true);
            sub.unsubscribe();
          },
          (err) => {
            this.alertsService.error(err.error, 'institution', 'institution', false, false);
            this.modalLoading = false;
            this.error = true;
            this.modalBottomAction = true;
          });
    }

  }

  createInstitution() {
    this.error = false;
    this.modalLoading = true;
    if (!this.formGroup.valid) {
      Object.entries(this.formGroup.controls).map(([key, val]) => {
        const seq = Object.keys(this.formGroup.controls).indexOf(key);
        this.institutionModalFields[seq].error = val.errors ? true : false;
      });
      this.modalLoading = false;
    } else {
      const body = {
        address: this.formGroup.value.address,
        contacts: {
          contactEmail: this.formGroup.value.contactEmail,
          contactPhone: this.formGroup.value.contactPhone,
          webpageAddress: this.formGroup.value.webpageAddress,
        },
        general: {
          name: this.formGroup.value.name,
          nameENG: this.formGroup.value.nameENG,
          ownerType: this.formGroup.value.ownerType,
          ownershipType: this.formGroup.value.ownershipType,
          studyInstitutionType: this.formGroup.value.studyInstitutionType,
        },
      };
      const sub = this.http
        .post(`${this.settings.url}/educational-institution/add`, body)
        .subscribe(
          (response: any) => {
            this.alertsService.info(response.message, 'institution', 'institution', false, false);
            this.modalLoading = false;
            this.modalBottomAction = true;
            this.modalService.close('institutionModal');
            this.viewReload = true;
            this.loading.initial = true;
            this.fetchData(true);
            sub.unsubscribe();
          },
          (err) => {
            this.alertsService.error(err.error, 'institution', 'institution', false, false);
            this.modalLoading = false;
            this.error = true;
            this.modalBottomAction = true;
          });
    }
  }

  ngOnInit() {
    this.initialize();
  }

  public initialize() {
    this.lang = 'et';
    this.currentRole = this.auth.userData.role.current_role.type;
    this.pathWatcher();
    this.startTime = Date.now();
    this.loading['initial'] = true;
    this.fetchData(true);
  }

  ngAfterViewChecked() {
    if (!this.endViewCheck) {
      this.initialTableCheck('table_0', 0, 0);
      this.initialTableCheck('table_1', 0, 1);
      if (this.data.educationalInstitutions && this.data.educationalInstitutions.length) {
        this.data.educationalInstitutions.forEach((elem, index) => {
          this.initialTableCheck(`juridicalFirst_${index}`, index, 0);
          this.initialTableCheck(`juridicalSecond_${index}`, index, 1);
          this.initialTableCheck(`juridicalThird_${index}`, index, 2);
        });
        if (document
          .getElementById(`juridicalThird_${(this.data.educationalInstitutions.length - 1)}`)) {
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
