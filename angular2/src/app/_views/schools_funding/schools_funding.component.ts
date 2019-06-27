import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FiltersService, DATEPICKER_FORMAT } from '@app/_services/filtersService';
import { HttpService } from '@app/_services/httpService';
import { Router, ActivatedRoute, Params, NavigationStart, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { RootScopeService } from '@app/_services/rootScopeService';
import { filter } from 'rxjs/operators';
import { EuroCurrencyPipe } from '@app/_pipes/euroCurrency';

@Component({
  templateUrl: "schools_funding.template.html",
  styleUrls: ["schools_funding.styles.scss"]
})

export class SchoolsFundingComponent extends FiltersService implements OnInit, OnDestroy {
  lang: string = this.rootScope.get("lang");
  subscriptions: Subscription[] = [];
  subscription: Subscription;
  parseFloat = parseFloat;
  toString = toString;

  showFilter: boolean;

  view: String = "schools";

  loading: boolean;

  map: any;
  data:any;
  polygonLabels: any;
  filterData: any = {};

  params:any = {};
  path: string;

  polygons: any;
  polygonLayer: String = "county";
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
    'jõgeva maakond': 'Jõgevamaa'
  }
  polygonValueLabels: any;
  polygonValueColors: any;
  lastHeatMapRange: {} = {}
  activeFontSize: string = '';
  fontSizes: Object = {
    md: '10px',
    lg: '18px',
  }
  labelOptions = {
    fontFamily: "'Rubik', sans-serif",
    lightColor: 'white',
    color: 'black',
    fontSize: '10px',
    fontWeight: 'regular',
  }
  icon = {
    url: '',
    scaledSize: {
      width: 0,
      height: 0
    }
  }

  heatMapColors = ["#FBE5C4","#FBD291","#F8B243","#F89229","#E2770D","#D5401A","#8B2F17"];
  heatMapRanges: Array<Object> = [];

  infoWindowFunding:any = false;
  
  infoLayer:any = false;

  mapOptions: any = {
    center: {
      lat: 58.5822061,
      lng: 24.7065513
    },
    zoom: 7.4,
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
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(null, null);
    let subscription = router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if((/^\/koolide-rahastus\/haldusüksused/g).test(decodeURI(event.url))) {
        this.changeView('areas');
      } else {
        this.changeView('schools');
      }
    });
    this.subscriptions = [...this.subscriptions, subscription];
  }

  showFunding(year, infoWindow:any = false ){
    this.infoWindowFunding = parseFloat(year);
    this.changeDetectorRef.detectChanges();

    if( year ){
      //this.map.panBy(0, -100);
    }
  }

  groupYears(data){
     let output = [];

    for( let i in data ){
      let unix = data[i].investmentDeadline.unix;
      let year:any = new Date(parseFloat(unix)*1000);
      year = year.getFullYear();

      if( output.indexOf(year) == -1 ){
        output.push(year);
      }
    }

    return output;
  }

  parseInfoWindowMarkerData( data ){
    
    for( let i in data ){
      let current = data[i];
      let unix = new Date(current.investmentDeadline['unix']*1000);
      let year:any = unix.getFullYear();
      current.year = parseFloat(year);
    }

    return data;
  }

  watchSearch() {

    let subscribe = this.route.queryParams.subscribe((params: ActivatedRoute) => {
      this.params = params;
      this.filterRetrieveParams( params );
      this.getData();
    });

    // Add subscription to main array for destroying
    this.subscriptions = [ ...this.subscriptions, subscribe];
  }

  changeView( view:String = "schools" ) {
    this.view = view;
    this.sumWindowStatus = false;
    sessionStorage.setItem("schools_funding.view", view.toString() );
    switch(view) {
      case 'areas':
        this.router.navigate(['/koolide-rahastus/haldusüksused'], {queryParamsHandling: "preserve"});
        break;
      case 'schools':
        this.router.navigate(['/koolide-rahastus'], {queryParamsHandling: "preserve"});
      default:
        break;
    }
    this.getData();
  }
  
  mapReady(map){
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

  fixCoordinates(entities) {

    let coordinates = [];

    for( var i in entities ){
      let item = entities[i];
      let lat = parseFloat( entities[i].lat );
      let lon = parseFloat( entities[i].lon );
      if( lat == null ){ continue; }

      let coords = lat+","+lon;

      if( coordinates.indexOf(coords) !== -1 ){
        entities[i].lon = lon+0.0005;
      }
      coordinates.push(coords);
    }

    return entities;
  }

  parseFilters( data ){

    let years = [];

    for( var i in data['investmentDeadline']['entities'] ){
      let year:any = data['investmentDeadline']['entities'][i]['investmentDeadline']['value'];
      year = parseInt(year.split("-")[0]);
      if( years.indexOf( year ) == -1 ){
        years.push(year);
      }
    }

    years = years.sort().reverse();

    data['investmentDeadline'] = years;

    return data;

  }
  getFilters() {

    let variables = {
      "lang": this.lang.toUpperCase()
    }

    let subscription = this.http.get('subsidyProjectFilters', {params:variables}).subscribe( data => {

      this.filterData = this.parseFilters( data['data'] );
  
      subscription.unsubscribe();
    });

  }

  mapLabelSwitcher() {
    this.mapOptions.styles = [];
    if( this.view == "areas" ){
      this.mapOptions.styles = [ { "elementType": "labels", "stylers": [{"visibility": "off"}] }, ...this.rootScope.get("mapStyles") ];
    } else { 
      this.mapOptions.styles = [ { "elementType": "labels", "stylers": [{"visibility": "on"}] }, ...this.rootScope.get("mapStyles") ];
    }
  }

  getData() {
    
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if(this.map){
      this.sumWindowStatus = false;
      //this.map.setZoom(this.mapOptions.zoom);
      //this.map.setCenter(this.mapOptions.center);
    }

    this.loading = true;

    let url = "subsidyProjectQueryLocation";

    this.mapLabelSwitcher();

    if( this.view == "schools" ){
      url = "subsidyProjectQuerySchool";
      this.heatMapRanges = [];
    }

    let variables = {
      "ownershipType": this.params.ownershipType ? this.params.ownershipType.split(",").map(n=>parseInt(n)) : [],
      "investmentMeasure": this.params.investmentMeasure ? this.params.investmentMeasure.split(",").map(n=>parseInt(n)) : [],
      "investmentDeadline": this.params.investmentDeadline ? this.params.investmentDeadline.split(",").map(n=>parseInt(n)) : [],
      "levelOfDetail": this.view == "schools" ? 3 : 1
    };

    if( this.polygonLayer == "kov" && this.view !== "schools" ){
      variables.levelOfDetail = 2;
    }

    this.subscription = this.http.get(url, {params:variables}).subscribe( data => {

      if( this.view == "schools" ){
        this.polygons = false;
        this.polygonData = false;
        this.loading = false;
        this.data = this.fixCoordinates(data['data']['CustomSubsidyProjectQuery']);
      }else{
        this.data = [];
        this.polygonData = data['data']['CustomSubsidyProjectQuery'];
        this.generateHeatmapColors();
        this.getPolygons();
      }
      
      this.subscription.unsubscribe();
    });
  }

  generateHeatmapColors() {
    let maxSum = 0;

    for( let i in this.polygonData ){
      if( this.polygonData[i].investmentAmountSum > maxSum ){
        maxSum = this.polygonData[i].investmentAmountSum;
      }
    }

    if( maxSum == 0 ){ maxSum = 1000000; }

    let sumPartial = maxSum / this.heatMapColors.length;

    this.lastHeatMapRange = {
      maxSum: maxSum,
      minSum: maxSum - sumPartial
    }

    let sumArray = [];

    for( var i in this.heatMapColors ){
      let multiplier:number = parseFloat(i)+1;
      let tmpArray = {
        maxAmount: multiplier * sumPartial
      }

      if( multiplier !== 1 ){
        tmpArray['minAmount'] = parseFloat(i) * sumPartial;
      }else{
        tmpArray['minAmount'] = 1000;
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
    this.polygonValueLabels = {};
    this.polygonValueColors = {};
    for( let i in data['features'] ){
      let current = data['features'][i];
      let properties = current['properties'];
      let name = properties['NIMI'].toLowerCase();

      var match:any = false;
      
      for( let o in this.polygonData ){
        if( name == this.polygonData[o].investmentLocation.toLowerCase() ){
          match = this.polygonData[o];
          this.polygonValueLabels[properties['NIMI']] = match.investmentAmountSum;
          if (match.investmentAmountSum >= this.lastHeatMapRange['minSum'] && match.investmentAmountSum <= this.lastHeatMapRange['maxSum']) {
            this.polygonValueColors[properties['NIMI']] = true;
          }
        }
      }

      let color = this.heatMapColors[0];

      for( let o in this.heatMapRanges ){

        if( !match.investmentAmountSum ) {
          color = "#cfcfcf";
        }
        else if( match.investmentAmountSum >= this.heatMapRanges[o]['minAmount'] && match.investmentAmountSum <= this.heatMapRanges[o]['maxAmount'] ){
          color = this.heatMapRanges[o]['color'];
          properties['investmentAmountSum'] = match.investmentAmountSum;
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
    let subscription = this.http.get(url).subscribe( data => {
      this.polygonLabels = data;
      this.mapPolyLabels(fontSize, polygons, polygonColors);
      subscription.unsubscribe();
    });
  }

  mapPolyLabels (fontSize, polygons, polygonColors) {
    this.activeFontSize = fontSize || this.labelOptions.fontSize;
    this.polygonLabels.map(elem => {
      let match = polygons && polygons[elem.NIMI] ? polygons[elem.NIMI] : '';
      let textLabel = match ? `${elem.label}\n${new EuroCurrencyPipe().transform(match)}` : elem.label;
      elem['labelOptions'] = {
        color: polygonColors[elem.NIMI] ? this.labelOptions.lightColor : this.labelOptions.color,
        fontSize: fontSize || this.labelOptions.fontSize,
        fontWeight: this.labelOptions.fontWeight,
        text: textLabel
      }
    });
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
      sum: $event.feature.getProperty('investmentAmountSum'),
      name: $event.feature.getProperty('NIMI')
    };

    if( !this.infoLayer.sum ){
      this.infoLayer.sum = 0;
    }

    this.sumWindowLat = $event.latLng.lat();
    this.sumWindowLon = $event.latLng.lng();

    this.sumWindowStatus = true;
    this.changeDetectorRef.detectChanges();
  }

  kmlClickStatus($isOpen: boolean){
    this.sumWindowStatus = $isOpen;
    this.changeDetectorRef.detectChanges();
  }

  kmlHover(){

  }

  changeLayer(name){
    this.polygonLayer = name;
    this.getData();
  }

  pathWatcher() { 
    let subscribe = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.path = this.router.url;
      }
    );
    this.subscriptions = [...this.subscriptions, subscribe];
  }

  ngOnInit() {

    this.pathWatcher();
    //as the spaniards say - lo haré mañana
    //TODO - more bulletproof solution for this
    if((/^\/koolide-rahastus\/haldusüksused/g).test(decodeURI(this.path))) {
      this.changeView('areas');
    } else {
      this.changeView(this.view);
    }
    this.mapOptions.styles = this.rootScope.get("mapStyles");
    this.getFilters();
    this.watchSearch();
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