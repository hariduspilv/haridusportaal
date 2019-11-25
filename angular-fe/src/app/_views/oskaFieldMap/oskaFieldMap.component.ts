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
  data:any;
  filterData: any = {};
  private indicatorLegendLabels: {} = {};

  params:any = {};
  path: string;

  polygons: any;
  polygonLabels: any;
  polygonValueLabels: any;
  polygonValueColors: any;
  polygonLayer: String = 'county';
  polygonData:any;

  shortMonthLabels: Object = {
    'tartu maakond': 'Tartumaa',
    'saare maakond': 'Saaremaa',
    'hiiu maakond': 'Hiiumaa',
    'harju maakond': 'Harjumaa',
    'ida-viru maakond': 'Ida-Virumaa',
    'rapla maakond': 'Raplamaa',
    'järva maakond': 'Järvamaa',
    'lääne-viru maakond': 'Lääne-Virumaa',
    'võru maakond': 'Võrumaa',
    'pärnu maakond': 'Pärnumaa',
    'viljandi maakond': 'Viljandimaa',
    'valga maakond': 'Valgamaa',
    'põlva maakond': 'Põlvamaa',
    'lääne maakond': 'Läänemaa',
    'jõgeva maakond': 'Jõgevamaa',
  };

  heatMapColors = ['#FBE5C4', '#FBD291', '#F8B243', '#F89229', '#E2770D', '#D5401A', '#8B2F17'];
  heatMapRanges: Array<Object> = [];
  private fieldMaxRanges: {} = {};

  infoWindowFunding:any = false;
  infoLayer:any = false;

  activeFontSize: string = '';
  fontSizes: Object = {
    sm: '14px',
    md: '18px',
    lg: '22px',
  };

  labelOptions = {
    lightColor: 'white',
    color: 'black',
    fontSize: '14px',
    fontWeight: 'regular',
  };
  icon = {
    url: '',
    scaledSize: {
      width: 0,
      height: 0,
    },
  };

  mapOptions = {
    center: {
      lat: 58.5822061,
      lng: 24.7065513,
    },
    minZoom: 7.4,
    maxZoom: 10,
    zoom: 7.4,
    clusterStyles: [
      {
        height: 50,
        width: 28,
      },
    ],
    styles: [],
  };

  constructor(
    private http: HttpClient,
    public router: Router,
    public route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
    private deviceService: DeviceDetectorService,
    private rootScope: RootScopeService,
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

  mapReady(map) {
    this.map = map;
    this.map.setZoom(this.mapOptions.zoom);
    this.map.setCenter(this.mapOptions.center);
  }

  zoomChange($event) {
    const { polygonValueLabels, polygonValueColors, fontSizes, activeFontSize } = this;
    if (!polygonValueLabels) {
      return;
    }
    if ($event < 9 && activeFontSize !== fontSizes['sm']) {
      this.getPolygonCenterCoords(fontSizes['sm'], polygonValueLabels, polygonValueColors);
    } else if ($event === 9 && activeFontSize !== fontSizes['md']) {
      this.getPolygonCenterCoords(fontSizes['md'], polygonValueLabels, polygonValueColors);
    } else if ($event === 10 && activeFontSize !== fontSizes['lg']) {
      this.getPolygonCenterCoords(fontSizes['lg'], polygonValueLabels, polygonValueColors);
    }
  }

  mapLabelSwitcher() {
    this.mapOptions.styles = [];
    this.mapOptions.styles = [{ elementType: 'labels', stylers: [{visibility: 'off' },{ 'color': '#f49f53' }] }, ...this.rootScope.get('mapStyles')];
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
  }

  filterGivenData(mapRefresh) {
    if (this.data && this.data.length) {
      if (this.map) {
        this.sumWindowStatus = false;
      }
      this.loading = true;
      this.polygonData = this.data.filter(elem => {
        if (this.filterFormItems['mapIndicator'] && this.filterFormItems['OSKAField']) return elem.mapIndicator === this.filterFormItems['mapIndicator'] && elem.OSKAField === this.filterFormItems['OSKAField'];
        if (this.filterFormItems['mapIndicator']) return elem.mapIndicator === this.filterFormItems['mapIndicator'];
        if (this.filterFormItems['OSKAField']) return elem.OSKAField === this.filterFormItems['OSKAField'];
        return true;
      });
      this.getPolygons();
    }
  }

  getData() {

    this.loading = true;
    this.mapLabelSwitcher();
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
      this.data = this.polygonData = rawData;
      this.generateHeatmapColors();
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

  generateHeatmapColors() {
    let maxSum = 0;
    const fieldSums = {};
    this.polygonData.forEach((item) => {
      if (item['division'] > maxSum) {
        maxSum = item['division'];
      }
      if (item['division'] > fieldSums[item.mapIndicator] || (!fieldSums[item.mapIndicator])) {
        fieldSums[item.mapIndicator] = item['division'];
      }
    });
    // let sumPartial = maxSum / this.heatMapColors.length;

    const sumArray = [];

    this.heatMapColors.forEach((item, index) => {
      // let multiplier:number = parseFloat(i)+1;
      const tmpArray = {
        amount: index + 1,
        color: item,
      };
      sumArray.push(tmpArray);
    });

    this.fieldMaxRanges = fieldSums;
    this.heatMapRanges = sumArray;

  }

  getPolygons() {
    const url = `/assets/polygons/${this.polygonLayer}.json`;
    const subscription = this.http.get(url).subscribe((data) => {
      this.polygonValueLabels = false;
      this.polygons = this.assignPolygonsColors(data);
      this.loading = false;
      subscription.unsubscribe();
    });
  }

  assignPolygonsColors(data) {
    this.polygonValueLabels = {};
    this.polygonValueColors = {};
    for (const i in data['features']) {
      const current = data['features'][i];
      const properties = current['properties'];
      const name = properties['NIMI'].toLowerCase();
      let match:any = false;

      for (const o in this.polygonData) {
        if (this.shortMonthLabels[name] == this.polygonData[o]['county']) {
          match = this.polygonData[o];
          this.polygonValueLabels[properties['NIMI']] = match.value;
          this.polygonValueColors[properties['NIMI']] = match.division;
        }
      }

      let color = this.heatMapColors[0];
      for (const o in this.heatMapRanges) {
        if (!match.division) {
          color = '#cfcfcf';
          properties['value'] = this.translate.get('errors.data_missing')['value'];
        } else if (match.division === this.heatMapRanges[o]['amount']) {
          color = this.heatMapRanges[o]['color'];
          properties['value'] = match.value;
          properties['field'] = match.OSKAField;
          break;
        }
      }

      properties['color'] = color;

    }
    this.getPolygonCenterCoords('', this.polygonValueLabels, this.polygonValueColors);
    return data;
  }

  getPolygonCenterCoords(fontSize, polygons, polygonColors) {
    if (this.polygonLabels) {
      this.mapPolyLabels(fontSize, polygons, polygonColors);
      return;
    }

    const url = '/assets/polygons/countyCenters.json';
    const subscription = this.http.get(url).subscribe((data) => {
      this.polygonLabels = data;
      this.mapPolyLabels(fontSize, polygons, polygonColors);
      subscription.unsubscribe();
    });
  }

  mapPolyLabels (fontSize, polygons, polygonColors) {
    this.activeFontSize = fontSize || this.labelOptions.fontSize;
    this.polygonLabels.map(elem => {
      let match = polygons && polygons[elem.NIMI] ? polygons[elem.NIMI] : '';
      if (match && match.length && !match.includes('%')) {
        match = (new LocaleNumberPipe).transform(match);
      }
      if (!elem.latitude || (elem.latitudeSm && elem.latitudeMd && elem.latitudeLg)) {
        if (this.activeFontSize === this.fontSizes['sm']) {
          elem.latitude = elem.latitudeSm;
        }
        if (this.activeFontSize === this.fontSizes['md']) {
          elem.latitude = elem.latitudeMd;
        }
        if (this.activeFontSize === this.fontSizes['lg']) {
          elem.latitude = elem.latitudeLg;
        }
      }
      elem['labelOptions'] = {
        color: polygonColors[elem.NIMI] === 7 ? this.labelOptions.lightColor : this.labelOptions.color,
        fontSize: this.activeFontSize,
        fontWeight: this.labelOptions.fontWeight,
        text: elem.label ? elem.label : match,
      };
    });
  }

  fieldPlaceholder() {
    return this.filterData.OSKAField && !this.filterData.OSKAField.length ?
    this.translate.get('errors.data_missing')['value'] :
    this.translate.get('oska.title_field')['value'];
  }

  polygonStyles(feature) {
    let color = '#cfcfcf';
    const keys = Object.keys(feature).join(',').split(',');
    for (const i in keys) {
      const key = keys[i];
      if (feature[key] && feature[key]['color']) {
        color = feature[key]['color'];
      }
    }

    return {
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 1,
      strokeOpacity: 1,
      clickable: true,
    };
  }

  sumWindowStatus: boolean = false;
  sumWindowLat: any;
  sumWindowLon: any;
  kmlDebounce: any;

  kmlClick($event) {

    let mouse;
    for (const i in $event) {
      if (typeof $event[i] == 'object' && $event[i]['clientX']) {
        mouse = $event[i];
      }
    }

    const val = $event.feature.getProperty('value');
    const textLabel = val && val.length && parseFloat(val) && !val.includes('%') ? (new LocaleNumberPipe).transform(val) : val;

    this.infoLayer = {
      left: mouse['clientX'] + 'px',
      top: mouse['clientY'] + 'px',
      value: textLabel,
      name: this.shortMonthLabels[$event.feature.getProperty('NIMI').toLowerCase()],
      field: $event.feature.getProperty('field'),
    };

    this.sumWindowLat = $event.latLng.lat();
    this.sumWindowLon = $event.latLng.lng();

    this.sumWindowStatus = true;
    this.changeDetectorRef.detectChanges();
  }

  kmlClickStatus($isOpen: boolean) {
    this.sumWindowStatus = $isOpen;
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit() {
    if (this.deviceService.isMobile()) {
      this.mapOptions.minZoom = 6;
    }
    this.mapOptions.styles = this.rootScope.get('mapStyles');
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
