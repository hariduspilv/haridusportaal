import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationStart, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { DeviceDetectorService } from 'ngx-device-detector';
import { FiltersService } from '@app/_services/filterService';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { RootScopeService } from '@app/_services/RootScopeService';
import { LocaleNumberPipe } from '@app/_pipes/localeNumber';
import { SettingsService } from '@app/_services';

@Component({
  templateUrl: 'oskaFieldMap.template.html',
  styleUrls: ['oskaFieldMap.styles.scss'],
})

export class OskaFieldMapComponent extends FiltersService implements OnInit, OnDestroy {
  lang: string = 'et';
  subscriptions: Subscription[] = [];
  parseFloat = parseFloat;
  toString = toString;

  showFilter: boolean;
  loading: boolean;

  map: any;
  data: any;
  filterData: any = {};
  private indicatorLegendLabels: {} = {};

  params: any = {};
  path: string;
  
  polygonValueLabels: any;
  polygonLayer: String = 'county';
  polygonData: any = {};

  parameters = [
    {
      label: 'Näitaja',
      value: '',
    },
    {
      label: 'Valdkond',
      value: '',
    },
  ];

  mapOptions = {
    polygonType: 'oskaField',
    centerLat: 58.5822061,
    centerLng: 24.7065513,
    zoom: 7.4,
    maxZoom: 10,
    minZoom: 7.4,
    draggable: true,
    zoomControl: true,
    streetViewControl: true,
    enableOuterLink: false,
    enableLabels: false,
    enableParameters: true,
    enablePolygonLegend: true,
    enablePolygonModal: true,
  };

  constructor(
    private http: HttpClient,
    public router: Router,
    public route: ActivatedRoute,
    private translate: TranslateService,
    private deviceService: DeviceDetectorService,
    private settings: SettingsService,
  ) {
    super(null, null);
  }

  changeView(url) {
    this.router.navigate([url]);
  }

  watchSearch() {

    const subscribe = this.route.queryParams.subscribe((params: ActivatedRoute) => {
      this.params = params;
      this.filterRetrieveParams(params);
      if (!this.filterFormItems['OSKAField'] || !this.filterFormItems['mapIndicator']) {
        if (!this.filterFormItems['mapIndicator'] && this.filterData['mapIndicator'].length) this.filterFormItems['mapIndicator'] = this.filterData['mapIndicator'][0];
        if (!this.filterFormItems['OSKAField'] && this.filterData['OSKAField'].length) {
          this.setRelatedFilter('mapIndicator', 'OSKAField');
          this.filterFormItems['OSKAField'] = this.filterData['OSKAField'][0];
        }
        this.filterSubmit();
      }
      this.filterGivenData(true);
    });

    // Add subscription to main array for destroying
    this.subscriptions = [...this.subscriptions, subscribe];
  }

  setRelatedFilter(current, sibling) {
    if (this.data && this.data.length) {
      this.filterData[sibling] = [];
      this.data.forEach((obj) => {
        if (current && obj[current] === this.filterFormItems[current] && obj[sibling] && !this.filterData[sibling].includes(obj[sibling])) {
          this.filterData[sibling].push(obj[sibling]);
        }
      });
      if (!this.filterData[sibling].length) {
        this.filterFormItems[sibling] = '';
      } else if (this.filterData[sibling].length && !this.filterData[sibling].includes(this.filterFormItems[sibling])) {
        this.filterFormItems[sibling] = this.filterData[sibling][0];
      }
    }
    this.parameters[0].value = this.filterFormItems.mapIndicator;
    this.parameters[1].value = this.filterFormItems.OSKAField;
  }

  filterGivenData(mapRefresh) {
    if (this.data && this.data.length) {
      this.loading = true;
      this.polygonData.county = this.data.filter(elem => {
        if (this.filterFormItems['mapIndicator'] && this.filterFormItems['OSKAField']) {
          return elem.mapIndicator === this.filterFormItems['mapIndicator'] && elem.OSKAField === this.filterFormItems['OSKAField'];
        }
        if (this.filterFormItems['mapIndicator']) {
          return elem.mapIndicator === this.filterFormItems['mapIndicator'];
        }
        if (this.filterFormItems['OSKAField']) {
          return elem.OSKAField === this.filterFormItems['OSKAField'];
        }
        return true;
      });
      this.mapPolygonKeys();
      this.getPolygons();
    }
  }

  mapPolygonKeys() {
    this.polygonData.county = this.polygonData.county.map((element) => {
      const newElement: any = {};
      Object.entries(element).map(([key, val]) => {
        let newKey = key;
        if (newKey === 'county') newKey = 'investmentLocation';
        if (newKey === 'value') {
          newKey = 'investmentAmountSum';
        }
        newElement[newKey] = key === 'value' ? parseInt(String(val)) : val;
      });
      return newElement;
    });
  }

  getData() {

    this.loading = true;
    const variables = {};

    const path = this.settings.query('oskaMapData', variables);

    const subscription = this.http.get(path).subscribe((data) => {
      let rawData = JSON.parse(data['data']['OskaMapQuery'][0]['OskaMapJson']);
      // Extra mapping for floating point numbers
      rawData = rawData.map(elem => [elem.join()]).map(elem => elem.join('').split(';')).map(item => {
        return {
          mapIndicator: item[0],
          OSKAField: item[7].replace(/"/g, ''),
          county: item[1].replace(/"/g, ''),
          localGovernment: item[2],
          value: item[3],
          division: parseInt(item[4], 10),
          endLabel: item[6].replace(/"/g, ''),
          startLabel: item[5].replace(/"/g, ''),
        };
      });
      rawData.shift();
      this.getUniqueFilters(rawData);
      this.data = this.polygonData['county'] = rawData;
      this.watchSearch();
      subscription.unsubscribe();
    });
  }

  getUniqueFilters(arr) {
    const field = [];
    const indicator = [];
    arr.forEach((obj) => {
      if (field && !field.includes(obj['OSKAField'])) {
        field.push(obj['OSKAField']);
      }
      if (indicator && !indicator.includes(obj['mapIndicator'])) {
        indicator.push(obj['mapIndicator']);
        this.indicatorLegendLabels[obj.mapIndicator] = {
          start: obj.startLabel,
          end: obj.endLabel,
        };
      }
    });
    this.filterData['OSKAField'] = field;
    this.filterData['mapIndicator'] = indicator;
  }

  getPolygons() {
    const url = `/assets/polygons/${this.polygonLayer}.json`;
    const subscription = this.http.get(url).subscribe((data) => {
      this.polygonValueLabels = false;
      this.loading = false;
      subscription.unsubscribe();
    });
  }

  fieldPlaceholder() {
    return this.filterData.OSKAField && !this.filterData.OSKAField.length ?
      this.translate.get('errors.data_missing')['value'] :
      this.translate.get('oska.title_field')['value'];
  }

  ngOnInit() {
    if (this.deviceService.isMobile()) {
      this.mapOptions.minZoom = 6;
    }
    this.getData();
  }

  ngOnDestroy() {
    /* Clear all subscriptions */
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }

}
