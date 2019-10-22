import { Component, Input, HostBinding, OnInit, OnChanges } from '@angular/core';
import { SidebarService } from '@app/_services';
import { collection, titleLess } from './helpers/sidebar';
import { arrayOfLength, parseUnixDate } from '@app/_core/utility';
import FieldVaryService from '@app/_services/FieldVaryService';
import conf from '@app/_core/conf';

interface SidebarType {
  [key: string]: string;
}
interface TitleLess {
  [key: string]: boolean;
}

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.template.html',
  styleUrls: ['./sidebar.styles.scss'],
})
export class SidebarComponent implements OnInit, OnChanges {
  @Input() data: any;
  @Input() feedbackNid: string = '';
  private collection: SidebarType = collection;
  private titleLess: TitleLess = titleLess;
  private keys: string[];
  private mappedData: any;
  @HostBinding('class') get hostClasses(): string {
    return 'sidebar';
  }
  constructor(private sidebarService: SidebarService) { }
  ngOnInit() {
    if (this.data) {
      this.data = FieldVaryService(this.data);
      if (this.data.sidebar && this.data.sidebar.entity) {
        Object.keys(this.data.sidebar.entity).forEach((elem) => {
          this.data[elem] = this.data.sidebar.entity[elem];
        });
      }
      this.mappedData = this.sidebarService.mapUniformKeys(FieldVaryService(this.data));
      this.keys = Object.keys(this.mappedData);
    }
  }

  ngOnChanges() {
    if (this.data) {
      this.data = FieldVaryService(this.data);
      if (this.data.sidebar && this.data.sidebar.entity) {
        Object.keys(this.data.sidebar.entity).forEach((elem) => {
          this.data[elem] = this.data.sidebar.entity[elem];
        });
      }
      this.mappedData = this.sidebarService.mapUniformKeys(FieldVaryService(this.data));
      this.keys = Object.keys(this.mappedData);
    }
  }
}
// Subcomponents
@Component({
  selector: 'sidebar-links',
  templateUrl: './templates/sidebar.links.template.html',
})
export class SidebarLinksComponent implements OnInit {
  @Input() data: Object[];
  ngOnInit() {
    this.data = this.data.map((item: any) => {
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
  }
}

@Component({
  selector: 'sidebar-categories',
  templateUrl: './templates/sidebar.categories.template.html',
})
export class SidebarCategoriesComponent implements OnInit {
  @Input() data: Object[];
  private entriesData: any[];
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
  ngOnInit() {
    if (this.data.entity) {
      this.data = FieldVaryService(this.data.entity);
    }
  }
}

@Component({
  selector: 'sidebar-articles',
  templateUrl: './templates/sidebar.articles.template.html',
})
export class SidebarArticlesComponent {
  @Input() data: Object;
}

@Component({
  selector: 'sidebar-data',
  template: '<b *ngIf="data.entity?.fieldTitle">{{ data.entity?.fieldTitle }}</b><div [innerHTML]="data.entity?.fieldAdditionalBody || data.value"><div>',
})
export class SidebarDataComponent {
  @Input() data: Object;
}

@Component({
  selector: 'sidebar-actions',
  templateUrl: './templates/sidebar.actions.template.html',
})
export class SidebarActionsComponent {
  @Input() data: Object[];
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
  ngOnInit() {
    if (this.data && this.data.length) {
      this.data.forEach((loc) => {
        const lat = parseFloat(loc['entity'].fieldCoordinates.lat);
        const lon = parseFloat(loc['entity'].fieldCoordinates.lon);
        this.options.centerLat = lat;
        this.options.centerLng = lon;
        this.markers.push({ Lat: lat, Lon: lon });
      });
    } else if (this.data.educationalInstitution) {
      this.data.educationalInstitution.entity.fieldSchoolLocation.forEach((loc) => {
        const lat = parseFloat(loc['entity'].fieldCoordinates.lat);
        const lon = parseFloat(loc['entity'].fieldCoordinates.lon);
        this.options.centerLat = lat;
        this.options.centerLng = lon;
        this.markers.push({ Lat: lat, Lon: lon });
      });
      this.data = this.data.educationalInstitution.entity.fieldSchoolLocation;
    } else {
      const lat = parseFloat(this.data.fieldEventLocation.lat);
      const lon = parseFloat(this.data.fieldEventLocation.lon);
      this.options.centerLat = lat;
      this.options.centerLng = lon;
      this.options.zoom = this.options.minZoom
        = this.options.maxZoom = parseInt(this.data.fieldEventLocation.zoom, 10);
      this.markers.push({ Lat: lat, Lon: lon });
      this.data = [this.data];
    }
  }
}

@Component({
  selector: 'sidebar-facts',
  templateUrl: './templates/sidebar.facts.template.html',
})
export class SidebarFactsComponent implements OnInit {
  @Input() data: any;
  private entitiesData: any[];
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
  private level: number;
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
  @Input() data: any;
  private unix: number;
  private iCalUrl: string;
  ngOnInit() {
    this.iCalUrl = `${conf.api_prefix}calendarexport/`;
    this.unix = parseUnixDate(new Date().getTime() / 1000);
  }
  canRegister() {
    let firstDate;
    let lastDate;
    if (this.data.fieldRegistrationDate) {
      firstDate =
        parseUnixDate(this.data.fieldRegistrationDate.entity.fieldRegistrationFirstDate.unix);
      lastDate =
        parseUnixDate(this.data.fieldRegistrationDate.entity.fieldRegistrationLastDate.unix);
    } else {
      firstDate = parseUnixDate(this.data.fieldEventMainDate.unix);
      lastDate = parseUnixDate(this.data.fieldEventMainDate.unix);
    }
    if (this.data.fieldMaxNumberOfParticipants !== null &&
      this.data.RegistrationCount >= this.data.fieldMaxNumberOfParticipants) return 'full';
    if (lastDate >= this.unix && firstDate <= this.unix) return true;
    if (firstDate > this.unix) return 'not_started';
    if (lastDate < this.unix) return 'ended';
  }
}
