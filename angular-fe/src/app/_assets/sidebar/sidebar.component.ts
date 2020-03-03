import { Component, Input, HostBinding, OnInit, OnChanges, ChangeDetectorRef } from '@angular/core';
import { SidebarService, SettingsService, ModalService, AlertsService } from '@app/_services';
import { collection, titleLess, parseProfessionData, parseFieldData, parseInfosystemData } from './helpers/sidebar';
import { arrayOfLength, parseUnixDate } from '@app/_core/utility';
import FieldVaryService from '@app/_services/FieldVaryService';
import conf from '@app/_core/conf';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface SidebarType {
  [key: string]: string;
}
interface TitleLess {
  [key: string]: boolean;
}

// tslint:disable
const sidebarOrder = {
  article: ['additional', 'fieldContactSection', 'fieldHyperlinks', 'fieldRelatedArticle'],
  school: ['fieldContact', 'fieldSchoolLocation'],
  profession: ['fillingBar', 'indicator', 'prosCons', 'fieldOskaField', 'fieldLearningOpportunities', 'fieldJobOpportunities', 'fieldQualificationStandard', 'fieldJobs', 'fieldQuickFind', 'fieldContact'],
  event: ['fieldRegistration', 'fieldEventLocation', 'fieldContact', 'additional'],
  infosystem: ['fieldEhisLinks', 'fieldButton', 'fieldLegislationBlock'],
  field: ['indicator', 'prosCons', 'fieldOskaResults', 'fieldQuickFind', 'fieldRelatedPages'],
  resultPage: ['additional', 'fieldContactSection', 'fieldHyperlinks', 'fieldRelatedArticle'],
  dashboard: ['gdpr', 'notifications', 'favourites', 'events', 'finalDocumentDownload', 'finalDocumentAccess', 'finalDocumentHistory'],
};
// tslint:enable

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.template.html',
  styleUrls: ['./sidebar.styles.scss'],
})
export class SidebarComponent implements OnInit, OnChanges {
  @Input() data: any;
  @Input() feedbackNid: string = '';

  private type: string;

  public isArray = Array.isArray;

  private collection: SidebarType = collection;
  private titleLess: TitleLess = titleLess;
  private keys: string[];
  private orderedKeys: string[] = [];

  public mappedData: any;
  @HostBinding('class') get hostClasses(): string {
    return 'sidebar';
  }
  constructor(
    private sidebarService: SidebarService,
    private route: ActivatedRoute,
    private translate: TranslateService,
  ) {
    if (route.snapshot.data.type) {
      this.type = route.snapshot.data.type;
    }
  }

  private getData(): void {
    if (this.data) {
      this.data = FieldVaryService(this.data);
      // Try to determine if its news data
      try {
        if (this.data['nodeQuery']['entities'][0]['entityUrl']['path'].match('uudised')) {
          this.data['newsQuery'] = this.data['nodeQuery'];
          delete this.data['nodeQuery'];
        }
      } catch (err) { }

      if (this.data.sidebar && this.data.sidebar.entity) {
        Object.keys(this.data.sidebar.entity).forEach((elem) => {
          this.data[elem] = this.data.sidebar.entity[elem];
        });
      }

      this.mappedData = this.sidebarService.mapUniformKeys(FieldVaryService(this.data));

      if (this.type === 'infosystem') {
        this.mappedData = parseInfosystemData(this.mappedData);
      }

      if (this.type === 'profession') {
        this.mappedData = parseProfessionData(this.mappedData, this.translate);
      }

      if (this.type === 'field') {
        this.mappedData = parseFieldData(this.mappedData, this.translate);
      }

      if (this.type === 'resultPage' ||
        this.type === 'surveyPage' ||
        this.type === 'event'
      ) {
        delete this.mappedData.links;
      }

      this.keys = Object.keys(this.mappedData);
      if (sidebarOrder[this.type]) {
        this.orderedKeys = [...sidebarOrder[this.type]];
      }

      this.keys.forEach((item) => {
        if (this.orderedKeys.indexOf(item) === -1) {
          this.orderedKeys.push(item);
        }
      });

    }
  }
  ngOnInit() {
    this.getData();
  }
  ngOnChanges() {
    this.getData();
  }

}
// Subcomponents
@Component({
  selector: 'sidebar-links',
  templateUrl: './templates/sidebar.links.template.html',
})
export class SidebarLinksComponent implements OnInit, OnChanges {
  @Input() data: Object[];
  public parsedData: Object[];
  public blocks;
  constructor() { }

  parseData() {
    this.parsedData = this.data.map((item: any) => {
      if (item['entity'] && item['entity'].entityLabel) {
        return {
          title: item['entity'].entityLabel,
          url: {
            path: item['entity'].entityUrl.path,
            routed: true,
          },
        };
      }
      if (item['entity'] && item['entity'].fieldJobName) {
        return {
          title: item['entity'].fieldJobName,
          url: {
            path: item['entity'].fieldJobLink.url.path,
            routed: item['entity'].fieldJobLink.url.routed,
          },
        };
      }

      return item;
    });

    if (this.data && this.data.length) {
      try {
        const blocks = [];
        this.data.forEach((item) => {
          if (item['entity']['fieldBlockLinks']) {
            let links = [];
            links = item['entity']['fieldBlockLinks'].map((link) => {
              return {
                title: link.entity.fieldLinkName,
                url: link.entity.fieldWebpageLink,
              };
            });
            blocks.push({
              links,
              title: item['entity']['fieldBlockTitle'],
            });
          }
        });
        this.blocks = blocks.length ? blocks : false;
      } catch (err) { }
    }
  }
  ngOnInit() {
    this.parseData();
  }
  ngOnChanges() {
    this.parseData();
  }
}

@Component({
  selector: 'sidebar-categories',
  templateUrl: './templates/sidebar.categories.template.html',
})
export class SidebarCategoriesComponent implements OnInit {
  @Input() data: Object[];
  public entriesData: any[];
  ngOnInit() {
    this.entriesData = Object.entries(this.data);
  }
}
@Component({
  selector: 'sidebar-contact',
  templateUrl: './templates/sidebar.contact.template.html',
})
export class SidebarContactComponent {
  @Input() data: any;
  public parsedData: any;

  ngOnInit() {
    if (this.data.entity) {
      this.parsedData = FieldVaryService(this.data.entity);
    } else {
      this.parsedData = this.data;
    }
  }
}

@Component({
  selector: 'sidebar-articles',
  templateUrl: './templates/sidebar.articles.template.html',
})
export class SidebarArticlesComponent {
  @Input() data;
}

@Component({
  selector: 'sidebar-data',
  templateUrl: './templates/sidebar.data.template.html',
})
export class SidebarDataComponent {
  @Input() data;
}

@Component({
  selector: 'sidebar-actions',
  templateUrl: './templates/sidebar.actions.template.html',
})
export class SidebarActionsComponent {
  @Input() data;
  @Input() icons;

  ngOnInit() {
    console.log(this.data);
  }
}
@Component({
  selector: 'sidebar-location',
  templateUrl: './templates/sidebar.location.template.html',
})
export class SidebarLocationComponent {
  @Input() data: any;
  private markers: any[] = [];
  private options = {
    centerLat: null,
    centerLng: null,
    zoom: 11,
    maxZoom: 11,
    minZoom: 11,
    enableOuterLink: true,
    enableZoomControl: false,
    enableStreetViewControl: false,
    draggable: false,
  };

  parseData() {
    if (this.data && this.data.length) {
      try {
        this.data.forEach((loc) => {
          const lat = parseFloat(loc['entity'].fieldCoordinates.lat);
          const lon = parseFloat(loc['entity'].fieldCoordinates.lon);
          this.options.centerLat = lat;
          this.options.centerLng = lon;
          this.markers.push({ Lat: lat, Lon: lon });
        });
      } catch (err) { }
    } else if (this.data.educationalInstitution) {
      try {
        this.data.educationalInstitution.entity.fieldSchoolLocation.forEach((loc) => {
          const lat = parseFloat(loc['entity'].fieldCoordinates.lat);
          const lon = parseFloat(loc['entity'].fieldCoordinates.lon);
          this.options.centerLat = lat;
          this.options.centerLng = lon;
          this.markers.push({ Lat: lat, Lon: lon });
        });
        this.data = this.data.educationalInstitution.entity.fieldSchoolLocation;
      } catch (err) { }
    } else {
      try {
        const lat = parseFloat(this.data.fieldEventLocation.lat);
        const lon = parseFloat(this.data.fieldEventLocation.lon);
        this.options.centerLat = lat;
        this.options.centerLng = lon;
        this.options.zoom = this.options.minZoom
          = this.options.maxZoom = parseInt(this.data.fieldEventLocation.zoom, 10);
        this.markers.push({ Lat: lat, Lon: lon });
        this.data = [this.data];
      } catch (err) {
        this.data = [this.data];
      }
    }

  }
  ngOnChanges() {
    this.parseData();
  }
  ngOnInit() {
    this.parseData();
  }
}

@Component({
  selector: 'sidebar-facts',
  templateUrl: './templates/sidebar.facts.template.html',
})
export class SidebarFactsComponent implements OnInit {
  @Input() data: any;
  public entitiesData: any[];
  private graduatesToJobsValues = [
    { class: 'first with-bg', text: 'oska.more_graduates' },
    { class: 'first with-bg', text: 'oska.less_graduates' },
    { class: 'second with-bg', text: 'oska.enough_graduates' },
    { class: 'third with-bg', text: 'oska.graduates_work_outside_field' },
    { class: 'fourth with-bg', text: 'oska.no_graduates' },
  ];
  private trendingValues = [
    { icon: 'arrow-up', class: 'second', text: 'oska.big_increase' },
    { icon: 'arrow-up-right', class: 'second', text: 'oska.increase' },
    { icon: 'arrow-right', class: 'third', text: 'oska.stagnant' },
    { icon: 'arrow-down-right', class: 'first', text: 'oska.decline' },
    { icon: 'arrow-down', class: 'first', text: 'oska.big_decline' },
  ];
  private createArr(len) {
    return arrayOfLength(len);
  }
  ngOnInit() {
    this.entitiesData = this.data.entities;
  }
}

@Component({
  selector: 'sidebar-progress',
  templateUrl: './templates/sidebar.progress.template.html',
})
export class SidebarProgressComponent {
  @Input() data: any;
  private competitionLabels = [
    'oska.simple',
    'oska.quite_simple',
    'oska.medium',
    'oska.quite_difficult',
    'oska.difficult',
  ];
  public level: number;
  ngOnInit() {
    if (this.data.entities && this.data.entities.length) {
      this.level = this.data.entities[0].value;
    }
  }
}

@Component({
  selector: 'sidebar-register',
  templateUrl: './templates/sidebar.register.template.html',
})
export class SidebarRegisterComponent {
  @Input() pageData;

  public formSubmitted: boolean = false;

  public form = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    companyName: [''],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    marked: [''],
  });

  constructor(
    private settings: SettingsService,
    public modal: ModalService,
    private formBuilder: FormBuilder,
    private http: HttpClient,
  ) { }
  @Input() data: any;
  private unix: number;
  private iCalUrl: string;
  public loading: boolean = false;
  public step: number = 1;
  public response;
  ngOnInit() {
    try {
      this.pageData = {
        ... this.pageData,
        eventTitle: this.pageData.entityLabel,
        eventStartDate: this.pageData.fieldEventMainDate,
        eventStartTime: this.pageData.fieldEventMainStartTime,
        eventEndTime: this.pageData.fieldEventMainEndTime,
        eventExtraDates: this.pageData.fieldEventDate,
      };
    } catch (err) { }

    this.iCalUrl = `${this.settings.url}/calendarexport/`;
    this.unix = parseUnixDate(new Date().getTime() / 1000);
  }

  public clearModal(): void {
    this.form.reset();
    this.loading = false;
    this.step = 1;
    this.response = undefined;
    this.formSubmitted = false;
  }
  public hasError(name: string = '') {
    return this.form.controls[name].invalid;
  }

  public submitForm() {
    this.formSubmitted = true;
    if (this.form.valid) {
      this.loading = true;

      const data = {
        queryId: 'cfad8e08bfdf881d6c7c6533744dc5eb20d3d160:1',
        variables: {
          event_id: this.pageData.nid,
          lang: 'ET',
          ... this.form.value,
        },
      };

      const register = this.http.post(`${this.settings.url}/graphql`, data).subscribe(
        (response) => {
          const data = response['data'];
          this.response = data['createEventRegistration'];
          this.step = 2;
          this.loading = false;
          register.unsubscribe();
        },
        (data) => {
          this.loading = false;
        });
    }
  }

  canRegister() {
    let firstDate;
    let lastDate;
    try {
      if (this.pageData.fieldRegistrationDate) {
        firstDate =
          parseUnixDate(this.pageData.fieldRegistrationDate.entity.fieldRegistrationFirstDate.unix);
        lastDate =
          parseUnixDate(this.pageData.fieldRegistrationDate.entity.fieldRegistrationLastDate.unix);
      } else {
        firstDate = parseUnixDate(this.pageData.fieldEventMainDate.unix);
        lastDate = parseUnixDate(this.pageData.fieldEventMainDate.unix);
      }
      if (this.pageData.fieldMaxNumberOfParticipants !== null &&
        this.pageData.RegistrationCount >= this.pageData.fieldMaxNumberOfParticipants) return 'full';
      if (lastDate >= this.unix && firstDate <= this.unix) return true;
      if (firstDate > this.unix) return 'not_started';
      if (lastDate < this.unix) return 'ended';
    } catch (err) { }
  }
}

@Component({
  selector: 'sidebar-events',
  templateUrl: './templates/sidebar.events.template.html',
})
export class SidebarEventsComponent {
  @Input() data: any;
}

@Component({
  selector: 'sidebar-notifications',
  templateUrl: './templates/sidebar.notifications.template.html',
})
export class SidebarNotificationsComponent {
  @Input() data: any;
}

@Component({
  selector: 'sidebar-gdpr',
  templateUrl: './templates/sidebar.gdpr.template.html',
})
export class SidebarGdprComponent {
  @Input() data: any;
}

@Component({
  selector: 'sidebar-finaldocument-access',
  templateUrl: './templates/sidebar.finaldocument-access.template.html',
})
export class SidebarFinalDocumentAccessComponent implements OnInit{
  @Input() data: any;
  constructor (
    public modal: ModalService,
    private formBuilder: FormBuilder,
    private settings: SettingsService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  public addAccessForm: FormGroup = this.formBuilder.group(
    {
      receiver: [],
      email: [],
      idCode: [],
      withGradesheet: [false],
      endDate: [''],
      noEndDate: [false],
    },
    {
      updateOn: 'change',
    });
  public filledAccessForm: FormGroup = this.formBuilder.group(
    {
      receiver: ['', { disabled: true }],
      email: ['', { disabled: true }],
      idCode: ['', { disabled: true }],
      withGradesheet: [false, { disabled: true }],
      endDate: ['', { disabled: true }],
      noEndDate: [false, { disabled: true }],
    },
    {
      updateOn: 'change',
    });

  public addAccessOptions = {
    receiver: [
      {
        key: 'Isikukoodiga',
        value: 'ACCESS_TYPE:ID_CODE',
      },
      {
        key: 'E-postiga',
        value: 'ACCESS_TYPE:ACCESS_CODE',
      },
    ],
    withGradesheet: [
      {
        key: 'Lõputunnistus',
        value: 'ACCESS_SCOPE:MAIN_DOCUMENT',
      },
      {
        key: 'Lõputunnistus koos hinnetelehega',
        value: 'ACCESS_SCOPE:WITH_ACCOMPANYING_DOCUMENTS',
      },
    ],
  };

  public activeAccesses: any = [];
  public inactiveAccesses: any = [];
  public openedAccess: any = {};
  public openedAccessLabelType: any;
  public openedAccessLabel = [];
  public accessAction = 'add';
  public issuingHistory = [];
  public actionHistory = [];

  openAccess(access) {
    this.openedAccess = { ...access };
    this.openedAccessLabel =
    [{ value: access.status === 'ACCESS_STATUS:VALID' ? 'kehtiv ligipääs' : 'kehtetu ligipääs' }];
    this.openedAccessLabelType = access.status === 'ACCESS_STATUS:VALID' ? 'green' : 'red';
    this.filledAccessForm.setValue({
      receiver: this.openedAccess.type,
      email: access.emailAddress ? this.openedAccess.emailAddress : null,
      idCode: !this.openedAccess.emailAddress ? this.openedAccess.accessorCode : null,
      withGradesheet: this.openedAccess.scope,
      endDate: this.openedAccess.endDate ? this.openedAccess.endDate.split('-').reverse().join('.') : null,
      noEndDate: !this.openedAccess.endDate ? true : false,
    });
    this.modal.toggle('finalDocument-access');
  }

  changeAccess() {
    this.accessAction = 'edit';
    console.log('HOW DOES THIS HAVE A VALUE', this.filledAccessForm.controls.endDate.value);
    this.addAccessForm.controls.receiver.setValue(this.filledAccessForm.controls.receiver.value);
    this.addAccessForm.controls.email.setValue(this.filledAccessForm.controls.email.value);
    this.addAccessForm.controls.idCode.setValue(this.filledAccessForm.controls.idCode.value);
    this.addAccessForm.controls.withGradesheet.setValue(this.filledAccessForm.controls.withGradesheet.value);
    this.addAccessForm.controls.endDate.setValue(this.filledAccessForm.controls.endDate.value || '');
    this.addAccessForm.controls.noEndDate.setValue(this.filledAccessForm.controls.noEndDate.value);
    this.modal.toggle('finalDocument-addAccess');
  }
  addAccess () {
    const form = this.addAccessForm.value;
    const indexId = this.route.snapshot.params.id;
    const accessDTO = {
      indexId,
      access: {
        type: form.receiver,
        scope: form.withGradesheet,
        endDate: form.noEndDate ? null : form.endDate.split('.').reverse().join('-'),
        accessorCode: form.receiver === 'ACCESS_TYPE:ID_CODE' ? form.idCode : null,
        emailAddress: form.receiver === 'ACCESS_TYPE:ACCESS_CODE' ? form.email : null,
      },
    };
    this.http
      .post(`${this.settings.url}/certificates/v1/certificateAccess`, accessDTO)
      .subscribe((val) => {
        this.modal.toggle('finalDocument-addAccess');
        this.addAccessForm.reset();
        this.getData();
      });
  }
  modifyAccess () {
    const form = this.addAccessForm.value;
    const indexId = this.route.snapshot.params.id;
    const accessDTO = {
      indexId,
      access: {
        id: indexId,
        scope: form.withGradesheet,
        endDate: form.noEndDate ? null : form.endDate.split('.').reverse().join('-'),
        endDateSet: !this.openedAccess.endDate && form.endDate ? true : false,
        scopeSet: this.openedAccess.scope !== form.withGradesheet ? true : false,
      },
    };
    this.http
      .patch(`${this.settings.url}/certificates/v1/certificateAccess`, accessDTO)
      .subscribe((val) => {
        this.modal.toggle('finalDocument-addAccess');
        this.addAccessForm.reset();
        this.getData();
      });
  }

  invalidateAccess() {
    const accessId = this.openedAccess.id;
    const certificateId = this.route.snapshot.params.id;
    this.http
      .delete(`${this.settings.url}/certificates/v1/certificateAccess?indexId=${certificateId}&accessId=${accessId}`)
      .subscribe((res: any) => {
        this.getData();
        this.openedAccess = res;
        this.openedAccessLabel = [{ value: res.status === 'ACCESS_STATUS:VALID' ? 'kehtiv ligipääs' : 'kehtetu ligipääs' }];
        this.openedAccessLabelType = res.status === 'ACCESS_STATUS:VALID' ? 'green' : 'red';
        this.modal.toggle('finalDocument-confirmInvalidation');
      });
  }
  getData () {
    const id = this.route.snapshot.params.id;
    // tslint:disable
    this.http
      .get(`${this.settings.url}/certificates/v1/certificateAccess?indexId=${id}&status=ACCESS_STATUS:VALID`)
      .subscribe((val) => {
        this.activeAccesses = val;
      });
    // tslint:enable
    // tslint:disable
    this.http
      .get(`${this.settings.url}/certificates/v1/certificateAccess?indexId=${id}&status=ACCESS_STATUS:INVALID`)
      .subscribe((val) => {
        this.inactiveAccesses = val;
      });
    // tslint:enable
  }
  ngOnInit () {
    this.getData();
  }
}

@Component({
  selector: 'sidebar-finaldocument-history',
  templateUrl: './templates/sidebar.finaldocument-history.template.html',
})
export class SidebarFinalDocumentHistoryComponent implements OnInit {
  constructor (
    private http: HttpClient,
    private settings: SettingsService,
    private route: ActivatedRoute,
    private modal: ModalService,
    private alertsService: AlertsService,
  ) {}
  @Input() data: any;
  public issuingHistory = [];
  public actionHistory = [];
  getData() {
    const id = this.route.snapshot.params.id;
    this.http
      .get(`${this.settings.url}/certificates/v1/certificateActions/${id}`)
      .subscribe((res: any) => {
        this.actionHistory = res.actions;
      });
    this.http
      .get(`${this.settings.url}/certificates/v1/certificateDataIssues/${id}`)
      .subscribe((res: any) => {
        this.issuingHistory = res.filter(el =>  el.issueBase !== 'OWNER').sort((a, b) => {
          if (new Date(a.issueTime) > new Date(b.issueTime)) {
            return -1;
          }
          if (new Date(a.issueTime) < new Date(b.issueTime)) {
            return 1;
          }
          return 0;
        });
        if (this.issuingHistory.length === 0) {
          this.alertsService.info(
            'Vaatamise ajaloo kirjeid ei leitud', 'historyModalAlerts', false,
          );
        }
      });
  }
  ngOnInit() {
    this.getData();
  }
}

@Component({
  selector: 'sidebar-finaldocument-download',
  templateUrl: './templates/sidebar.finaldocument-download.template.html',
})
export class SidebarFinalDocumentDownloadComponent {
  @Input() data: any;
}