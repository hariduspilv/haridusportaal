import { ChangeDetectorRef, Component, HostBinding, Input, OnChanges, OnInit, SimpleChanges, OnDestroy } from '@angular/core';
import { AlertsService, ModalService, SettingsService, SidebarService } from '@app/_services';
import {
  collection,
  parseFieldData,
  parseInfosystemData,
  parseProfessionData,
  titleLess
} from './helpers/sidebar';
import { arrayOfLength, parseUnixDate } from '@app/_core/utility';
import FieldVaryService from '@app/_services/FieldVaryService';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { saveAs } from 'file-saver';
import { Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';

interface SidebarType {
  [key: string]: string;
}

interface TitleLess {
  [key: string]: boolean;
}

// tslint:disable
const sidebarOrder = {
  article: [
    "additional",
    "fieldContactSection",
    "fieldHyperlinks",
    "fieldRelatedArticle"
  ],
  school: ["fieldContact", "fieldSchoolLocation"],
  profession: [
    "fillingBar",
    "indicator",
    "prosCons",
    "fieldOskaField",
    "fieldLearningOpportunities",
    "fieldJobOpportunities",
    "fieldQualificationStandard",
    "fieldJobs",
    "fieldQuickFind",
    "fieldContact"
  ],
  event: [
    "fieldRegistration",
    "fieldEventLocation",
    "fieldContact",
    "additional"
  ],
  infosystem: ["fieldEhisLinks", "fieldButton", "fieldLegislationBlock"],
  field: [
    "indicator",
    "prosCons",
    "fieldOskaResults",
    "fieldQuickFind",
    "fieldRelatedPages"
  ],
  resultPage: [
    "additional",
    "fieldContactSection",
    "fieldHyperlinks",
    "fieldRelatedArticle"
  ],
  dashboard: [
    "gdpr",
    "notifications",
    "favourites",
    "events",
    "finalDocumentDownload",
    "finalDocumentAccess",
    "finalDocumentHistory"
  ]
};

// tslint:enable

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.template.html',
  styleUrls: ['./sidebar.styles.scss']
})
export class SidebarComponent implements OnInit, OnChanges {
  @Input() public data: any;
  @Input() public feedbackNid: string = '';
  public isArray = Array.isArray;
  public mappedData: any;
  private type: string;
  private collection: SidebarType = collection;
  private titleLess: TitleLess = titleLess;
  private keys: string[];
  private orderedKeys: string[] = [];

  constructor(
    private sidebarService: SidebarService,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {
    if (route.snapshot.data.type) {
      this.type = route.snapshot.data.type;
    }
  }

  @HostBinding('class') get hostClasses(): string {
    return 'sidebar';
  }

  public ngOnInit() {
    this.getData();
  }

  public ngOnChanges() {
    this.getData();
  }

  private getData(): void {
    if (this.data) {
      this.data = FieldVaryService(this.data);
      // Try to determine if its news data
      try {
        if (
          this.data.nodeQuery.entities[0].entityUrl.path.match(
            'uudised'
          )
        ) {
          this.data.newsQuery = this.data.nodeQuery;
          delete this.data.nodeQuery;
        }
      } catch (err) {
      }

      if (this.data.sidebar && this.data.sidebar.entity) {
        Object.keys(this.data.sidebar.entity).forEach(elem => {
          this.data[elem] = this.data.sidebar.entity[elem];
        });
      }

      this.mappedData = this.sidebarService.mapUniformKeys(
        FieldVaryService(this.data)
      );

      if (this.type === 'infosystem') {
        this.mappedData = parseInfosystemData(this.mappedData);
      }

      if (this.type === 'profession') {
        this.mappedData = parseProfessionData(this.mappedData, this.translate);
      }

      if (this.type === 'field') {
        this.mappedData = parseFieldData(this.mappedData, this.translate);
      }

      if (
        this.type === 'resultPage' ||
        this.type === 'surveyPage' ||
        this.type === 'event'
      ) {
        delete this.mappedData.links;
      }

      this.keys = Object.keys(this.mappedData);
      if (sidebarOrder[this.type]) {
        this.orderedKeys = [...sidebarOrder[this.type]];
      }

      this.keys.forEach(item => {
        if (this.orderedKeys.indexOf(item) === -1) {
          this.orderedKeys.push(item);
        }
      });
    }
  }
}

// Subcomponents
@Component({
  selector: 'sidebar-links',
  templateUrl: './templates/sidebar.links.template.html'
})
export class SidebarLinksComponent implements OnInit, OnChanges {
  @Input() public data: Object[];
  public parsedData: Object[];
  public blocks;

  constructor() {
  }

  public parseData() {
    this.parsedData = this.data.map((item: any) => {
      if (item.entity && item.entity.entityLabel) {
        return {
          title: item.entity.entityLabel,
          url: {
            path: item.entity.entityUrl.path,
            routed: true
          }
        };
      }
      if (item.entity && item.entity.fieldJobName) {
        return {
          title: item.entity.fieldJobName,
          url: {
            path: item.entity.fieldJobLink.url.path,
            routed: item.entity.fieldJobLink.url.routed,
          }
        };
      }

      return item;
    });

    if (this.data && this.data.length) {
      try {
        const blocks = [];
        this.data.forEach((item: any) => {
          if (item.entity.fieldBlockLinks) {
            let links = [];
            links = item.entity.fieldBlockLinks.map((link) => {
              return {
                title: link.entity.fieldLinkName,
                url: link.entity.fieldWebpageLink,
              };
            });
            blocks.push({
              links,
              title: item.entity.fieldBlockTitle,
            });
          }
        });
        this.blocks = blocks.length ? blocks : false;
      } catch (err) {
      }
    }
  }

  public ngOnInit() {
    this.parseData();
  }

  public ngOnChanges() {
    this.parseData();
  }
}

@Component({
  selector: 'sidebar-categories',
  templateUrl: './templates/sidebar.categories.template.html'
})
export class SidebarCategoriesComponent implements OnInit {
  @Input() public data: Object[];
  public entriesData: any[];

  public ngOnInit() {
    this.entriesData = Object.entries(this.data);
  }
}

@Component({
  selector: 'sidebar-contact',
  templateUrl: './templates/sidebar.contact.template.html'
})
export class SidebarContactComponent {
  @Input() public data: any;
  public parsedData: any;

  public ngOnInit() {
    if (this.data.entity) {
      this.parsedData = FieldVaryService(this.data.entity);
    } else {
      this.parsedData = this.data;
    }
  }
}

@Component({
  selector: 'sidebar-articles',
  templateUrl: './templates/sidebar.articles.template.html'
})
export class SidebarArticlesComponent {
  @Input() public data;
}

@Component({
  selector: 'sidebar-data',
  templateUrl: './templates/sidebar.data.template.html'
})
export class SidebarDataComponent {
  @Input() public data;
}

@Component({
  selector: 'sidebar-actions',
  templateUrl: './templates/sidebar.actions.template.html'
})
export class SidebarActionsComponent {
  @Input() public data;
  @Input() public icons;
}

@Component({
  selector: 'sidebar-location',
  templateUrl: './templates/sidebar.location.template.html'
})
export class SidebarLocationComponent {
  @Input() public data: any;
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
    draggable: false
  };

  public parseData() {
    if (this.data && this.data.length) {
      try {
        this.data.forEach(loc => {
          const lat = parseFloat(loc.entity.fieldCoordinates.lat);
          const lon = parseFloat(loc.entity.fieldCoordinates.lon);
          this.options.centerLat = lat;
          this.options.centerLng = lon;
          this.markers.push({ Lat: lat, Lon: lon });
        });
      } catch (err) {
      }
    } else if (this.data.educationalInstitution) {
      try {
        this.data.educationalInstitution.entity.fieldSchoolLocation.forEach(
          loc => {
            const lat = parseFloat(loc.entity.fieldCoordinates.lat);
            const lon = parseFloat(loc.entity.fieldCoordinates.lon);
            this.options.centerLat = lat;
            this.options.centerLng = lon;
            this.markers.push({ Lat: lat, Lon: lon });
          }
        );
        this.data = this.data.educationalInstitution.entity.fieldSchoolLocation;
      } catch (err) {
      }
    } else {
      try {
        const lat = parseFloat(this.data.fieldEventLocation.lat);
        const lon = parseFloat(this.data.fieldEventLocation.lon);
        this.options.centerLat = lat;
        this.options.centerLng = lon;
        this.options.zoom = this.options.minZoom = this.options.maxZoom = parseInt(
          this.data.fieldEventLocation.zoom,
          10
        );
        this.markers.push({ Lat: lat, Lon: lon });
        this.data = [this.data];
      } catch (err) {
        this.data = [this.data];
      }
    }
  }

  public ngOnChanges() {
    this.parseData();
  }

  public ngOnInit() {
    this.parseData();
  }
}

@Component({
  selector: 'sidebar-facts',
  templateUrl: './templates/sidebar.facts.template.html'
})
export class SidebarFactsComponent implements OnInit {
  @Input() public data: any;
  public entitiesData: any[];
  private graduatesToJobsValues = [
    { class: 'first with-bg', text: 'oska.more_graduates' },
    { class: 'first with-bg', text: 'oska.less_graduates' },
    { class: 'second with-bg', text: 'oska.enough_graduates' },
    { class: 'third with-bg', text: 'oska.graduates_work_outside_field' },
    { class: 'fourth with-bg', text: 'oska.no_graduates' }
  ];
  private trendingValues = [
    { icon: 'arrow-up', class: 'second', text: 'oska.big_increase' },
    { icon: 'arrow-up-right', class: 'second', text: 'oska.increase' },
    { icon: 'arrow-right', class: 'third', text: 'oska.stagnant' },
    { icon: 'arrow-down-right', class: 'first', text: 'oska.decline' },
    { icon: 'arrow-down', class: 'first', text: 'oska.big_decline' }
  ];

  public ngOnInit() {
    this.entitiesData = this.data.entities;
  }

  private createArr(len) {
    return arrayOfLength(len);
  }
}

@Component({
  selector: 'sidebar-progress',
  templateUrl: './templates/sidebar.progress.template.html'
})
export class SidebarProgressComponent {
  @Input() public data: any;
  public level: number;
  private competitionLabels = [
    'oska.simple',
    'oska.quite_simple',
    'oska.medium',
    'oska.quite_difficult',
    'oska.difficult'
  ];

  public ngOnInit() {
    if (this.data.entities && this.data.entities.length) {
      this.level = this.data.entities[0].value;
    }
  }
}

@Component({
  selector: 'sidebar-register',
  templateUrl: './templates/sidebar.register.template.html'
})
export class SidebarRegisterComponent {
  @Input() public pageData;

  public formSubmitted: boolean = false;

  public form = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    companyName: [''],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    marked: ['']
  });

  @Input() public data: any;
  public loading: boolean = false;
  public step: number = 1;
  public response;
  private unix: number;
  private iCalUrl: string;

  constructor(
    private settings: SettingsService,
    public modal: ModalService,
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) {
  }

  public ngOnInit() {
    try {
      this.pageData = {
        ...this.pageData,
        eventTitle: this.pageData.entityLabel,
        eventStartDate: this.pageData.fieldEventMainDate,
        eventStartTime: this.pageData.fieldEventMainStartTime,
        eventEndTime: this.pageData.fieldEventMainEndTime,
        eventExtraDates: this.pageData.fieldEventDate
      };
    } catch (err) {
    }

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
          ...this.form.value
        }
      };

      const register = this.http
        .post(`${this.settings.url}/graphql`, data)
        .subscribe(
          (response: any) => {
            const data = response.data;
            this.response = data.createEventRegistration;
            this.step = 2;
            this.loading = false;
            register.unsubscribe();
          },
          (data) => {
            this.loading = false;
          }
        );
    }
  }

  public canRegister() {
    let firstDate;
    let lastDate;
    try {
      if (this.pageData.fieldRegistrationDate) {
        firstDate = parseUnixDate(
          this.pageData.fieldRegistrationDate.entity.fieldRegistrationFirstDate
            .unix
        );
        lastDate = parseUnixDate(
          this.pageData.fieldRegistrationDate.entity.fieldRegistrationLastDate
            .unix
        );
      } else {
        firstDate = parseUnixDate(this.pageData.fieldEventMainDate.unix);
        lastDate = parseUnixDate(this.pageData.fieldEventMainDate.unix);
      }
      if (
        this.pageData.fieldMaxNumberOfParticipants !== null &&
        this.pageData.RegistrationCount >=
        this.pageData.fieldMaxNumberOfParticipants
      ) {
        return 'full';
      }
      if (lastDate >= this.unix && firstDate <= this.unix) return true;
      if (firstDate > this.unix) return 'not_started';
      if (lastDate < this.unix) return 'ended';
    } catch (err) {
    }
  }
}

@Component({
  selector: 'sidebar-events',
  templateUrl: './templates/sidebar.events.template.html'
})
export class SidebarEventsComponent {
  @Input() public data: any;
}

@Component({
  selector: 'sidebar-notifications',
  templateUrl: './templates/sidebar.notifications.template.html'
})
export class SidebarNotificationsComponent {
  @Input() public data: any;
}

@Component({
  selector: 'sidebar-gdpr',
  templateUrl: './templates/sidebar.gdpr.template.html'
})
export class SidebarGdprComponent {
  @Input() public data: any;
}

@Component({
  selector: 'sidebar-finaldocument-access',
  templateUrl: './templates/sidebar.finaldocument-access.template.html',
})
export class SidebarFinalDocumentAccessComponent implements OnInit, OnDestroy {
  @Input() public data: any;
  public errors = {
    required: 'Väli on kohustuslik',
  };
  private destroy$: Subject<boolean> = new Subject();

  public addAccessForm: FormGroup = this.formBuilder.group(
    {
      type: [],
      emailAddress: [],
      accessorCode: [],
      scope: ['ACCESS_SCOPE:MAIN_DOCUMENT', { validators: [Validators.required] }],
      endDate: [],
      noEndDate: [false],
      accessId: [],
      provider: [],
    },
  );
  public addAccessOptions = {
    type: [
      {
        key: 'Isikukoodiga',
        value: 'ACCESS_TYPE:ID_CODE',
        info: this.translate.get('certificates.access_code_info'),
      },
      {
        key: 'E-postiga',
        value: 'ACCESS_TYPE:ACCESS_CODE',
        info: this.translate.get('certificates.id_code_info'),
      },
    ],
    scope: [
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

  constructor(
    public modal: ModalService,
    private formBuilder: FormBuilder,
    private settings: SettingsService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private alertsService: AlertsService,
    private translate: TranslateService,
  ) {
  }

  public ngOnInit(): void {
    this.getData();
    this.formChanges();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  public formChanges() {
    this.addAccessForm.controls.noEndDate.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
    ).subscribe((val) => {
      if (val) {
        this.addAccessForm.controls.endDate.reset();
      }
    });
  }

  public openAccess(access): void {
    this.openedAccessLabel = [
      {
        value:
          access.status === 'ACCESS_STATUS:VALID'
            ? 'kehtiv ligipääs'
            : 'kehtetu ligipääs',
      },
    ];
    this.openedAccessLabelType =
      access.status === 'ACCESS_STATUS:VALID' ? 'green' : 'red';
    this.addAccessForm.reset();
    this.addAccessForm.setValue({
      type: access.type,
      emailAddress: access.emailAddress ? access.emailAddress : null,
      accessorCode: access.accessorCode,
      scope: access.scope,
      endDate: access.endDate
        ? access.endDate
          .split('-')
          .reverse()
          .join('.')
        : null,
      noEndDate: !access.endDate ? true : false,
      accessId: access.id,
      provider: access.accessProvider,
    });
    this.modal.toggle('finalDocument-access');
  }

  public openNewAccessModal() {
    this.modal.toggle('finalDocument-addAccess');
    this.addAccessForm.reset();
    this.addAccessForm.clearValidators();
    this.addAccessForm.controls.scope.setValue('ACCESS_SCOPE:MAIN_DOCUMENT');
    const date = new Date();
    this.addAccessForm.controls.endDate.setValue(
      new Date(date.setMonth(date.getMonth() + 1)).toISOString().slice(0, 10).split('-')
      .reverse()
      .join('.'),
    );
    this.accessAction = 'add';
  }

  public changeAccess(): void {
    this.accessAction = 'edit';
    this.modal.toggle('finalDocument-addAccess');
  }

  public addAccess(): void {
    this.addAccessForm.clearValidators();
    this.addAccessForm.controls.emailAddress.setValidators([Validators.email]);
    this.addAccessForm.controls.emailAddress.updateValueAndValidity();
    this.addAccessForm.setValidators(
      [
        this.emailAddressOrIdCodeValidator,
        this.endDateOrNoEndDateValidator,
      ]);
    this.addAccessForm.updateValueAndValidity();
    if (this.addAccessForm.invalid) {
      return;
    }
    const form = this.addAccessForm.value;
    const indexId = this.route.snapshot.params.id;
    if (form.accessorCode) {
      const startsWithLetters =
        isNaN(form.accessorCode.charAt(0)) && isNaN(form.accessorCode.charAt(1));
      if (!startsWithLetters) {
        this.addAccessForm.controls.accessorCode.setValue(`EE${form.accessorCode.trim()}`);
        form.accessorCode = this.addAccessForm.controls.accessorCode.value;
      }
    }
    const accessDTO = {
      indexId,
      access: {
        type: form.type,
        scope: form.scope,
        endDate: form.noEndDate
          ? null
          : form.endDate
            .split('.')
            .reverse()
            .join('-'),
        accessorCode:
          form.type === 'ACCESS_TYPE:ID_CODE' ? form.accessorCode : null,
        emailAddress:
          form.type === 'ACCESS_TYPE:ACCESS_CODE' ? form.emailAddress : null,
      },
    };
    this.http
      .post(`${this.settings.ehisUrl}/certificates/v1/certificateAccess`, accessDTO)
      .subscribe(
        (val) => {
          this.modal.toggle('finalDocument-addAccess');
          this.addAccessForm.reset();
          this.getData();
        },
        (err) => {
          this.alertsService
            .error(err.error.errors[0].message, 'addAccessErrors', 'accessErrors', true);
        }
      );
  }

  public modifyAccess(): void {
    const form = this.addAccessForm.value;
    this.addAccessForm.clearValidators();
    this.addAccessForm
      .setValidators([this.emailAddressOrIdCodeValidator, this.endDateOrNoEndDateValidator]);
    this.addAccessForm.updateValueAndValidity();
    if (this.addAccessForm.invalid) {
      return;
    }
    const indexId = this.route.snapshot.params.id;
    const accessDTO = {
      indexId,
      access: {
        id: form.accessId,
        scope: form.scope,
        endDate: form.noEndDate
          ? null
          : form.endDate
            .split('.')
            .reverse()
            .join('-'),
        endDateSet: form.endDate ? true : false,
        scopeSet: form.scope ? true : false,
      },
    };
    this.http
      .patch(
        `${this.settings.ehisUrl}/certificates/v1/certificateAccess`,
        accessDTO,
      )
      .subscribe((val) => {
        this.modal.toggle('finalDocument-addAccess');
        this.addAccessForm.reset();
        this.getData();
      });
  }

  public invalidateAccess(): void {
    const accessId = this.addAccessForm.value.accessId;
    const certificateId = this.route.snapshot.params.id;
    this.http
      .delete(
        `${this.settings.ehisUrl}/certificates/v1/certificateAccess\
				?indexId=${certificateId}&accessId=${accessId}`,
      )
      .subscribe((res: any) => {
        this.getData();
        this.openedAccess = res;
        this.openedAccessLabel = [
          {
            value:
              res.status === 'ACCESS_STATUS:VALID'
                ? 'kehtiv ligipääs'
                : 'kehtetu ligipääs',
          },
        ];
        this.openedAccessLabelType =
          res.status === 'ACCESS_STATUS:VALID' ? 'green' : 'red';
        this.modal.toggle('finalDocument-confirmInvalidation');
      });
  }

  public openInvalidAccesses(): void {
    this.modal.toggle('finalDocument-invalidAccesses');
    if (this.inactiveAccesses.length === 0) {
      window.setTimeout(() => {
        this.alertsService.info(
          'Kehtetuid ligipääse pole',
          'invalidAccessesAlerts',
          false,
        );
      },                1);
    }
  }

  private getData(): void {
    const id = this.route.snapshot.params.id;
    this.http
      .get(
        `${this.settings.ehisUrl}/certificates/v1/certificateAccess\
				?indexId=${id}&status=ACCESS_STATUS:VALID`,
      )
      .subscribe((val) => {
        this.activeAccesses = val;
      });
    this.http
      .get(
        `${this.settings.ehisUrl}/certificates/v1/certificateAccess\
				?indexId=${id}&status=ACCESS_STATUS:INVALID`,
      )
      .subscribe((val) => {
        this.inactiveAccesses = val;
        this.inactiveAccesses = this.inactiveAccesses.sort((a, b) => {
          if (a.issued > b.issued) {
            return -1;
          }
          if (a.issued < b.issued) {
            return 1;
          }
          if (a.issued === b.issued) {
            return 0;
          }
        });
      });
  }

  private emailAddressOrIdCodeValidator: ValidatorFn
  = (control: FormGroup): ValidationErrors | null => {
    const accessorCode = control.get('accessorCode');
    const emailAddress = control.get('emailAddress');
    if (!accessorCode.value && !emailAddress.value) {
      return { emailOrIdCodeMissing: true };
    }
    return null;
  }
  private endDateOrNoEndDateValidator: ValidatorFn
  = (control: FormGroup): ValidationErrors | null => {
    const noEndDate = control.get('noEndDate');
    const endDate = control.get('endDate');
    if (!noEndDate.value && !endDate.value) {
      return { mustHaveEndDateOption: true };
    }
    return null;
  }
}

@Component({
  selector: 'sidebar-finaldocument-history',
  templateUrl: './templates/sidebar.finaldocument-history.template.html'
})
export class SidebarFinalDocumentHistoryComponent implements OnInit {
  @Input() public data: any;
  public issuingHistory = [];
  public actionHistory = [];
  public documentCache = {};
  public loadingDocument: boolean = true;
  public loadingDocumentError: boolean = false;
  public documentToShow: number;

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
    private route: ActivatedRoute,
    public modal: ModalService,
    private alertsService: AlertsService,
  ) {
  }

  public ngOnInit() {
    this.getData();
  }

  public getDocument(documentId) {
    this.loadingDocumentError = false;
    this.loadingDocument = true;
    this.http.get(
      `${this.settings.ehisUrl}/certificates/v1/certificateDocument/${documentId}`).subscribe(
      (res: any) => {
        const document = res.document;
        document.content = JSON.parse(document.content);
        this.documentCache[res.document.id] = document;
        this.loadingDocument = false;
      },
      () => {
        this.loadingDocumentError = true;
        this.loadingDocument = false;
        this.alertsService.error('certificates.loading_error', 'documentAlerts', '', true);
      });
  }

  public openDocument(document) {
    this.modal.close('finalDocument-actionHistory');
    this.documentToShow = document;
    if (!this.documentCache[document.id]) {
      this.getDocument(document.id);
    }
    this.modal.toggle('finalDocument-document');
  }

  public openIssueHistory() {
    this.modal.toggle('finalDocument-issueHistory');
    if (this.issuingHistory.length === 0) {
      window.setTimeout(() => {
        this.alertsService.info(
          'Vaatamise ajaloo kirjeid ei leitud',
          'historyModalAlerts',
          false,
        );
      },                1);
    }
  }

  public openActionHistory() {
    this.modal.toggle('finalDocument-actionHistory');
    if (this.actionHistory.length === 0) {
      window.setTimeout(() => {
        this.alertsService.info(
          'Väljastamise ajaloo kirjeid ei leitud',
          'actionHistoryModalAlerts',
          false,
        );
      },                1);
    }
  }

  private getData(): void {
    const id = this.route.snapshot.params.id;
    this.http
      .get(`${this.settings.ehisUrl}/certificates/v1/certificateActions/${id}`)
      .subscribe((res: any) => {
        this.actionHistory = res.actions.sort((a, b) => {
          if (new Date(a.added) > new Date(b.added)) {
            return -1;
          }
          if (new Date(a.issueTime) < new Date(b.added)) {
            return 1;
          }
          return 0;
        });
      });
    this.http
      .get(`${this.settings.ehisUrl}/certificates/v1/certificateDataIssues/${id}`)
      .subscribe((res: any) => {
        this.issuingHistory = res
          .filter(el => el.issueBase !== 'OWNER')
          .sort((a, b) => {
            if (new Date(a.issueTime) > new Date(b.issueTime)) {
              return -1;
            }
            if (new Date(a.issueTime) < new Date(b.issueTime)) {
              return 1;
            }
            return 0;
          });
      });
  }
}

@Component({
  selector: 'sidebar-finaldocument-download',
  templateUrl: './templates/sidebar.finaldocument-download.template.html'
})
export class SidebarFinalDocumentDownloadComponent {
  public hasAccessToAccompanyingDocuments = false;
  @Input() public data: any;

  public downloadForm: FormGroup;
  public downloadOptions = {
    fileFormat: [
      {
        value: 'PDF',
        key: 'PDF (allkirjastamata fail)',
      },
      {
        value: 'ASICE',
        key: 'ASICE (allkirjastatud fail)',
      },
    ],
    scope: [
      {
        key: 'Lõputunnistus',
        value: 'MAIN_DOCUMENT',
      },
      {
        key: 'Lõputunnistus koos hinnetelehega',
        value: 'WITH_ACCOMPANYING_DOCUMENTS',
      }
    ]
  };

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public modal: ModalService,
  ) {
  }

  public downloadTranscript(): void {
    const id = this.route.snapshot.params.id;
    if (this.downloadForm.invalid) {
      return;
    }

    this.modal.close('finalDocument-download');

    const form = this.downloadForm.value;

    this.http
      .get(
        `${this.settings.ehisUrl}/certificates/v1/certificateTranscript/${id}?scope=${form.scope}&fileFormat=${form.fileFormat}`,
        {
          headers: { 'Content-Type': 'application/*' },
          responseType: 'blob',
        },
      )
      .subscribe((res: any) => {
        saveAs(
          new File(
            [res], `${this.data.certificateName} lõputunnistus ${this.data.certificateNumber}`,
            {
              type: 'application/pdf',
            },
          ),
        );
      });
  }

  public ngOnInit() {
    this.hasAccessToAccompanyingDocuments = this.data.hasGradeSheet && (!this.data.withAccess
      || this.data.accessScope === 'ACCESS_SCOPE:WITH_ACCOMPANYING_DOCUMENTS');
    this.initializeForm();
  }

  private initializeForm() {

    this.downloadForm = this.fb.group(
      {
        scope: [this.hasAccessToAccompanyingDocuments ? 'WITH_ACCOMPANYING_DOCUMENTS' : 'MAIN_DOCUMENT'],
        fileFormat: ['PDF'],
      },
    );
  }
}
