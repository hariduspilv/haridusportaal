import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FiltersService, DATEPICKER_FORMAT } from '@app/_services/filtersService';
import { HttpService } from '@app/_services/httpService';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { RootScopeService } from '@app/_services/rootScopeService';

@Component({
  templateUrl: "schools_funding.template.html",
  styleUrls: ["schools_funding.styles.scss"]
})

export class SchoolsFundingComponent extends FiltersService implements OnInit, OnDestroy {
  lang: string;
  subscriptions: Subscription[] = [];
  parseFloat = parseFloat;
  toString = toString;

  view: String = localStorage.getItem("schools_funding.view") || "schools";

  loading: boolean;

  map: any;
  data:any;
  filterData: any;

  params:any;

  polygons: any;
  polygonLayer: String = "county";
  polygonData:any;

  heatMapColors = ["#fbe5c4", "#fbd291", "#f8b243", "#f89229", "#e2770d", "#d5401a", "#8b2f17"];
  heatMapRanges: Array<Object> = [];

  infoWindowFunding:any = false;
  
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
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(null, null);
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
    localStorage.setItem("schools_funding.view", view.toString() );
    this.map.setZoom(this.mapOptions.zoom);
    this.map.setCenter(this.mapOptions.center);
    this.getData();
  }
  
  mapReady(map){
    this.map = map;
    this.map.setZoom(this.mapOptions.zoom);
    this.map.setCenter(this.mapOptions.center);
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

    let url = "/graphql?queryId=subsidyProjectFilters:1&variables=";
    let variables = {
      "lang": this.lang.toUpperCase()
    }

    let subscription = this.http.get(url+JSON.stringify( variables ) ).subscribe( data => {

      this.filterData = this.parseFilters( data['data'] );
  
      subscription.unsubscribe();
    });

  }

  getData() {

    this.loading = true;

    let url = "/graphql?queryId=subsidyProjectQueryLocation:1&variables=";

    if( this.view == "schools" ){
      url = "/graphql?queryId=subsidyProjectQuerySchool:1&variables=";
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

    let subscription = this.http.get(url+JSON.stringify(variables)).subscribe( data => {

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
      
      subscription.unsubscribe();
    });
  }

  generateHeatmapColors() {
    let maxSum = 0;

    for( let i in this.polygonData ){
      if( this.polygonData[i].investmentAmountSum > maxSum ){
        maxSum = this.polygonData[i].investmentAmountSum;
      }
    }

    let sumPartial = maxSum / this.heatMapColors.length;

    let sumArray = [];

    for( var i in this.heatMapColors ){
      let multiplier:number = parseFloat(i)+1;
      let tmpArray = {
        maxAmount: multiplier * sumPartial
      }

      if( multiplier !== 1 ){
        tmpArray['minAmount'] = parseFloat(i) * sumPartial;
      }else{
        tmpArray['minAmount'] = "0";
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

      let match:any = false;
      
      for( let o in this.polygonData ){
        if( name == this.polygonData[o].investmentLocation.toLowerCase() ){
          match = this.polygonData[o];
        }
      }

      let color = this.heatMapColors[0];

      for( let o in this.heatMapRanges ){
        if( match.investmentAmountSum >= this.heatMapRanges[o]['minAmount'] && match.investmentAmountSum <= this.heatMapRanges[o]['maxAmount'] ){
          color = this.heatMapRanges[o]['color'];
          break;
        }
      }

      properties['color'] = color;
      
      
    }

    return data;
  }

  polygonStyles(feature) {
    let color = feature['f']['color'];
    

    return {
      fillColor: color,
      fillOpacity: 1,
      strokeColor: "#fff",
      strokeWeight: 1,
      strokeOpacity: 1
    };
  }

  changeLayer(name){
    this.polygonLayer = name;
    this.getData();
  }
  setPaths() {
    this.rootScope.set('langOptions', {
      'en': '/en/school-funding',
      'et': '/et/koolide-rahastus'
    });
  }

  pathWatcher() { 
    let subscribe = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.lang = params['lang'];
      }
    );

    this.subscriptions = [...this.subscriptions, subscribe];
  }

  ngOnInit() {

    this.mapOptions.styles = this.rootScope.get("mapStyles");
    this.setPaths();
    this.pathWatcher();
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