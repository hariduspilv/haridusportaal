import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationStart, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { LocaleNumberPipe } from '@app/_pipes/localeNumber';
import { FiltersService } from '@app/_services/filterService';
import { RootScopeService } from '@app/_services/RootScopeService';

@Component({
  templateUrl: "oska.sectors.map.html",
  styleUrls: ["../oska.sectors/oska.sectors.styles.scss"]
})

export class OskaFieldMapComponent extends FiltersService implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  parseFloat = parseFloat;
  toString = toString;

  showFilter: boolean;
  loading: boolean;

  map: any;
  data: any;
  filterData: any = {};

  params: any = {};
  path: string;

  polygons: any;
  polygonLabels: any;
  polygonValueLabels: any;
  polygonValueColors: any;
  polygonLayer: String = "county";
  polygonData: any;

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
    'jõgeva maakond': 'Jõgevamaa'
  }

  heatMapColors = ["#FBE5C4", "#FBD291", "#F8B243", "#F89229", "#E2770D", "#D5401A", "#8B2F17"];
  heatMapRanges: Array<Object> = [];

  infoWindowFunding: any = false;
  infoLayer: any = false;

  activeFontSize: string = '';
  fontSizes: Object = {
    md: '9px',
    lg: '18px',
  }

  labelOptions = {
    lightColor: 'white',
    color: 'black',
    fontSize: '9px',
    fontWeight: 'regular',
  }
  icon = {
    url: '',
    scaledSize: {
      width: 0,
      height: 0
    }
  }

  mapOptions = {
    center: {
      lat: 58.5822061,
      lng: 24.7065513
    },
    zoom: 7.4,
    clusterStyles: [
      {
        height: 50,
        width: 28
      }
    ],
    styles: []
  }

  constructor(
    private http: HttpClient,
    public router: Router,
    public route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
    private rootScope: RootScopeService,
  ) {
    super(null, null);
  }

  changeView(url) {
    this.router.navigate([url]);
  }

  watchSearch() {

    let subscribe = this.route.queryParams.subscribe((params: ActivatedRoute) => {
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
    if ($event < 9 && activeFontSize !== fontSizes['md']) {
      this.getPolygonCenterCoords(fontSizes['md'], polygonValueLabels, polygonValueColors);
    } else if ($event >= 9 && activeFontSize !== fontSizes['lg']) {
      this.getPolygonCenterCoords(fontSizes['lg'], polygonValueLabels, polygonValueColors);
    }
  }

  mapLabelSwitcher() {
    this.mapOptions.styles = [];
    this.mapOptions.styles = [
      {
        "elementType": "labels", "stylers": [
          { "visibility": "off" }, { "color": "#f49f53" }
        ]
      }, ...this.rootScope.get("mapStyles")];
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
      } else if (this.filterData[sibling].length && !this.filterFormItems[sibling]) {
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
    let variables = {};

    let subscription = this.http.get('oskaMapData', { params: variables }).subscribe(data => {
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
          startLabel: item[5].replace(/"/g, '')
        }
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
    let field = [];
    let indicator = [];
    arr.forEach((obj) => {
      if (field && !field.includes(obj['OSKAField'])) {
        field.push(obj['OSKAField']);
      }
      if (indicator && !indicator.includes(obj['mapIndicator'])) {
        indicator.push(obj['mapIndicator']);
      }
    });
    this.filterData['OSKAField'] = field;
    this.filterData['mapIndicator'] = indicator;
  }

  generateHeatmapColors() {
    let maxSum = 0;

    for (let i in this.polygonData) {
      if (this.polygonData[i]['division'] > maxSum) {
        maxSum = this.polygonData[i]['division'];
      }
    }

    if (maxSum < 1) { maxSum = 7; }

    let sumPartial = maxSum / this.heatMapColors.length;

    let sumArray = [];

    for (var i in this.heatMapColors) {
      let multiplier: number = parseFloat(i) + 1;
      let tmpArray = {
        amount: multiplier * sumPartial
      }

      tmpArray['color'] = this.heatMapColors[i];

      sumArray.push(tmpArray);
    }

    this.heatMapRanges = sumArray;

  }

  getPolygons() {
    let url = "/assets/polygons/" + this.polygonLayer + ".json";
    let subscription = this.http.get(url).subscribe(data => {
      this.polygonValueLabels = false;
      this.polygons = this.assignPolygonsColors(data);
      this.loading = false;
      subscription.unsubscribe();
    });
  }

  assignPolygonsColors(data) {
    this.polygonValueLabels = {};
    this.polygonValueColors = {};
    for (let i in data['features']) {
      let current = data['features'][i];
      let properties = current['properties'];
      let name = properties['NIMI'].toLowerCase();
      var match: any = false;

      for (let o in this.polygonData) {
        if (this.shortMonthLabels[name] == this.polygonData[o]['county']) {
          match = this.polygonData[o];
          this.polygonValueLabels[properties['NIMI']] = match.value;
          this.polygonValueColors[properties['NIMI']] = match.division;
        }
      }


      let color = this.heatMapColors[0];
      for (let o in this.heatMapRanges) {
        if (!match.division) {
          color = "#cfcfcf";
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

    let url = "/assets/polygons/countyCenters.json";
    let subscription = this.http.get(url).subscribe(data => {
      this.polygonLabels = data;
      this.mapPolyLabels(fontSize, polygons, polygonColors);
      subscription.unsubscribe();
    });
  }

  mapPolyLabels(fontSize, polygons, polygonColors) {
    this.activeFontSize = fontSize || this.labelOptions.fontSize;
    this.polygonLabels.map(elem => {
      let match = polygons && polygons[elem.NIMI] ? polygons[elem.NIMI] : '';
      if (match && match.length && !match.includes('%')) {
        match = (new LocaleNumberPipe).transform(match);
      }
      let textLabel = match ? `${elem.label} ${match}` : elem.label;
      elem['labelOptions'] = {
        color: polygonColors[elem.NIMI] === 7 ? this.labelOptions.lightColor : this.labelOptions.color,
        fontSize: fontSize || this.labelOptions.fontSize,
        fontWeight: this.labelOptions.fontWeight,
        text: textLabel
      }
    });
  }

  fieldPlaceholder() {
    return this.filterData.OSKAField && !this.filterData.OSKAField.length ?
      this.translate.get('errors.data_missing')['value'] :
      this.translate.get('oska.title_field')['value'];
  }

  polygonStyles(feature) {
    let color = "#cfcfcf";
    let keys = Object.keys(feature).join(",").split(",");

    for (let i in keys) {
      let key = keys[i];
      if (feature[key] && feature[key]['color']) {
        color = feature[key]['color'];
      }
    }

    return {
      fillColor: color,
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 1,
      strokeOpacity: 1,
      clickable: true
    };
  }

  sumWindowStatus: boolean = false;
  sumWindowLat: any;
  sumWindowLon: any;
  kmlDebounce: any;

  kmlClick($event) {

    let mouse;
    for (let i in $event) {
      if (typeof $event[i] == 'object' && $event[i]['clientX']) {
        mouse = $event[i];
      }
    }

    let val = $event.feature.getProperty('value');
    let textLabel =
      val && val.length && parseFloat(val) && !val.includes('%')
        ? (new LocaleNumberPipe).transform(val) :
        val;

    this.infoLayer = {
      left: mouse['clientX'] + "px",
      top: mouse['clientY'] + "px",
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
    this.mapOptions.styles = this.rootScope.get("mapStyles");
    this.getData();
  }

  ngOnDestroy() {
    /* Clear all subscriptions */
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }

}