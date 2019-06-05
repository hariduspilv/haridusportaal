import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FiltersService, DATEPICKER_FORMAT } from '@app/_services/filtersService';
import { HttpService } from '@app/_services/httpService';
import { Router, ActivatedRoute, Params, NavigationStart, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { RootScopeService } from '@app/_services/rootScopeService';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: "oska.sectors.map.html",
  styleUrls: ["../oska.sectors/oska.sectors.styles.scss"]
})

export class OskaSectorsMapComponent extends FiltersService implements OnInit, OnDestroy {
  lang: string = this.rootScope.get("lang");
  subscriptions: Subscription[] = [];
  parseFloat = parseFloat;
  toString = toString;

  showFilter: boolean;
  loading: boolean;

  map: any;
  data:any;
  filterData: any = {};

  params:any = {};
  path: string;

  polygons: any;
  polygonLayer: String = "county";
  polygonData:any;

  heatMapColors = ["#FBE5C4","#FBD291","#F8B243","#F89229","#E2770D","#D5401A","#8B2F17"];
  heatMapRanges: Array<Object> = [];

  infoWindowFunding:any = false;
  
  infoLayer:any = false;

  mapOptions = {
    center: {
      lat: 58.5822061,
      lng: 24.7065513
    },
    zoom: 7.2,
    icon: "/assets/marker.png",
    clusterStyles: [
      {
          textColor: "#FFFFFF",
          url: "/assets/cluster.svg",
          height: 50,
          width: 28
      }
    ],
    styles: []
  }

  constructor(
    private http: HttpService,
    public router: Router,
    public route: ActivatedRoute,
    public rootScope: RootScopeService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService
  ) {
    super(null, null);
  }

  changeView(url) {
    this.router.navigate([url]);
  }

  watchSearch() {

    let subscribe = this.route.queryParams.subscribe((params: ActivatedRoute) => {
      this.params = params;
      this.filterRetrieveParams( params );
      if (!this.filterFormItems['OSKAField'] || !this.filterFormItems['mapIndicator']) {
        if (!this.filterFormItems['OSKAField'] && this.filterData['OSKAField'].length) this.filterFormItems['OSKAField'] = this.filterData['OSKAField'][0];
        if (!this.filterFormItems['mapIndicator'] && this.filterData['mapIndicator'].length) this.filterFormItems['mapIndicator'] = this.filterData['mapIndicator'][0];
        this.filterSubmit(); 
      }
      this.filterGivenData(true);
    });

    // Add subscription to main array for destroying
    this.subscriptions = [ ...this.subscriptions, subscribe];
  }
  
  mapReady(map){
    this.map = map;
    this.map.setZoom(this.mapOptions.zoom);
    this.map.setCenter(this.mapOptions.center);
  }

  mapLabelSwitcher() {
    this.mapOptions.styles.push({
      "elementType": "labels",
      "stylers": [
          {
              "visibility": "off"
          },
          {
              "color": "#f49f53"
          }
      ]
    });
  }

  setRelatedFilter(current, sibling) {
    if (this.data && this.data.length) {
      this.filterData[sibling] = [];
      this.data.forEach((obj) => {
        if (current && obj[current] === this.filterFormItems[current] && obj[sibling] && !this.filterData[sibling].includes(obj[sibling])) {
          this.filterData[sibling].push(obj[sibling]);
        }
      });
    }
  }

  filterGivenData(mapRefresh) {
    if (this.data && this.data.length) {
      if(this.map){
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

    // if( this.polygonLayer == "kov" ){
    //   variables.levelOfDetail = 2;
    // }

    let subscription = this.http.get('oskaMapData', {params:variables}).subscribe( data => {
      let rawData = JSON.parse(data['data']['OskaMapQuery'][0]['OskaMapJson']);
      rawData = rawData.map(elem => elem.join('').split(';')).map(item => {
        return { 
          mapIndicator: item[0],
          OSKAField: item[5].replace(/"/g, ''),
          county: item[1].replace(/"/g, ''),
          localGovernment: item[2],
          value: parseFloat(item[3]),
          division: parseInt(item[4], 10)
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

    for( let i in this.polygonData ){
      if( this.polygonData[i]['division'] > maxSum ){
        maxSum = this.polygonData[i]['division'];
      }
    }

    if( maxSum < 1 ){ maxSum = 7; }

    let sumPartial = maxSum / this.heatMapColors.length;

    let sumArray = [];

    for( var i in this.heatMapColors ){
      let multiplier:number = parseFloat(i)+1;
      let tmpArray = {
        amount: multiplier * sumPartial
      }

      tmpArray['color'] = this.heatMapColors[i];

      sumArray.push(tmpArray);
    }

    this.heatMapRanges = sumArray;

  }

  getPolygons() {
    let url = "/assets/polygons/"+this.polygonLayer+".json";
    let subscription = this.http.get(url).subscribe( data => {
      this.polygons = this.assignPolygonsColors(data);
      this.loading = false;
      subscription.unsubscribe();
    });
  }

  assignPolygonsColors( data ) {

    for( let i in data['features'] ){
      let current = data['features'][i];
      let properties = current['properties'];
      let name = properties['NIMI'].toLowerCase();

      var match:any = false;

      for( let o in this.polygonData ){
        if( name == this.polygonData[o]['county'].toLowerCase() ){
          match = this.polygonData[o];
        }
      }
      
      
      let color = this.heatMapColors[0];
      for( let o in this.heatMapRanges ){
        if( !match.division ) {
          color = "#cfcfcf";
          properties['value'] = this.translate.get('errors.data_missing')['value'];
        } else if( match.division === this.heatMapRanges[o]['amount'] ){
          color = this.heatMapRanges[o]['color'];
          properties['value'] = match.value * 100;
          properties['field'] = match.OSKAField;
          break;
        }
      }

      properties['color'] = color;

      
      
    }

    return data;
  }

  polygonStyles(feature) {

    let color = "#cfcfcf";
    let keys = Object.keys(feature).join(",").split(",");

    for( let i in keys ){
      let key = keys[i];
      if( feature[key] && feature[key]['color'] ){
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
    for( let i in $event ){
      if( typeof $event[i] == 'object' && $event[i]['clientX'] ){
        mouse = $event[i];
      }
    }

    this.infoLayer = {
      left: mouse['clientX']+"px",
      top: mouse['clientY']+"px",
      value: $event.feature.getProperty('value') > 0 ? parseInt($event.feature.getProperty('value'), 10) : $event.feature.getProperty('value'),
      name: $event.feature.getProperty('NIMI'),
      field: $event.feature.getProperty('field'),
    };

    this.sumWindowLat = $event.latLng.lat();
    this.sumWindowLon = $event.latLng.lng();

    this.sumWindowStatus = true;
    this.changeDetectorRef.detectChanges();
  }

  kmlClickStatus($isOpen: boolean){
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