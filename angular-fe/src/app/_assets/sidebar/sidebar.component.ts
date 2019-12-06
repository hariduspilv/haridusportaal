import { Component, Input, HostBinding, OnInit, OnChanges, ChangeDetectorRef } from '@angular/core';
import { SidebarService, SettingsService, ModalService } from '@app/_services';
import { collection, titleLess, parseProfessionData, parseFieldData } from './helpers/sidebar';
import { arrayOfLength, parseUnixDate } from '@app/_core/utility';
import FieldVaryService from '@app/_services/FieldVaryService';
import conf from '@app/_core/conf';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { FormBuilder, Validators } from '@angular/forms';
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
  infosystem: ['fieldButton', 'fieldLegislationBlock'],
  field: ['indicator', 'prosCons', 'fieldOskaResults', 'fieldQuickFind', 'fieldRelatedPages'],
  resultPage: ['additional', 'fieldContactSection', 'fieldHyperlinks', 'fieldRelatedArticle'],
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

  private collection: SidebarType = collection;
  private titleLess: TitleLess = titleLess;
  private keys: string[];
  private orderedKeys: string [] = [];

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

  private getData():void {
    if (this.data) {
      this.data = FieldVaryService(this.data);

      // Try to determine if its news data
      try {
        if (this.data['nodeQuery']['entities'][0]['entityUrl']['path'].match('uudised')) {
          this.data['newsQuery'] = this.data['nodeQuery'];
          delete this.data['nodeQuery'];
        }
      } catch (err) {}

      if (this.data.sidebar && this.data.sidebar.entity) {
        Object.keys(this.data.sidebar.entity).forEach((elem) => {
          this.data[elem] = this.data.sidebar.entity[elem];
        });
      }

      this.mappedData = this.sidebarService.mapUniformKeys(FieldVaryService(this.data));

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
export class SidebarLinksComponent implements OnInit, OnChanges{
  @Input() data: Object[];
  public parsedData: Object[];
  public blocks;
  constructor() {}

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
      } catch (err) {}
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
      } catch (err) {}
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
      } catch (err) {}
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
  )
  {}
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
    } catch (err) {}

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
      console.log(firstDate, this.unix);
      if (this.pageData.fieldMaxNumberOfParticipants !== null &&
        this.pageData.RegistrationCount >= this.pageData.fieldMaxNumberOfParticipants) return 'full';
      if (lastDate >= this.unix && firstDate <= this.unix) return true;
      if (firstDate > this.unix) return 'not_started';
      if (lastDate < this.unix) return 'ended';
    } catch(err) {}
  }
}

@Component({
  selector: 'sidebar-events',
  templateUrl: './templates/sidebar.events.template.html',
})
export class SidebarEventsComponent {
  @Input() data: any;
}
