import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FiltersService, DATEPICKER_FORMAT } from '@app/_services/filtersService';
import { Subscription } from 'rxjs/Subscription';
import { delay } from 'rxjs/operators/delay';

import { of } from 'rxjs/observable/of';

import 'rxjs/add/operator/map';

import { Observable } from 'rxjs/Observable';

import { RootScopeService } from '@app/_services/rootScopeService';

import { HttpService } from '@app/_services/httpService';

/* Datepicker Imports */
import * as _moment from 'moment';
const moment = _moment;
import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material";
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import { AgmCoreModule } from '@agm/core';
import { TranslateService } from '@ngx-translate/core';


@Component({
  templateUrl: './schools.template.html',
  styleUrls: ['./schools.styles.scss'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: DATEPICKER_FORMAT},
  ]
})

export class SchoolsComponent extends FiltersService implements OnInit, OnDestroy{

  dataSubscription: Subscription;
  parseFloat = parseFloat;
  showFilter: boolean;
  limit: Number = 5;
  mapLimit: Number = 3000;

  params: object;
  offset: Number;
  list: any;
  listEnd: boolean;
  path: any;
  lang: any;

  boundsEnabled: boolean = false;

  view: any = sessionStorage.getItem("schools.view") || "list";

  loading: boolean = true;

  languageOptions = [];
  ownershipOptions = [];
  typeOptions = [];
  institutionTypes = [];

  map: any;


  mapOptions = {
    lat: 58.5822061,
    lng: 24.7065513,
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

  bounds = {
    minLat: "0",
    maxLat: "99",
    minLon: "0",
    maxLon: "99"
  }

  subscriptions: Subscription[] = [];

  latlngBounds: any;

  constructor(
    private rootScope: RootScopeService,
    public router: Router,
    public route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private http: HttpService,
    private translate: TranslateService,
  ) {
    super(null, null);
  }

  getSubTypes(key:any){
    let output = [];
    
    if( this.filterFormItems[key] && this.filterFormItems[key] !== "" ){
      for( let i in this.typeOptions ){
        if( this.typeOptions[i].parentId == this.filterFormItems[key] ){
          output.push( this.typeOptions[i] );
        }
      }
    }

    return output;
  }
  mapReady(map){

    let that = this;
    this.map = map;

    this.map.setZoom(this.mapOptions.zoom);

    function getCoords(){
      let bounds = that.map.getBounds();
      let ne = bounds.getNorthEast();
      let sw = bounds.getSouthWest();

      that.bounds.minLat = sw.lat().toString();
      that.bounds.maxLat = ne.lat().toString();
      that.bounds.minLon = sw.lng().toString();
      that.bounds.maxLon = ne.lng().toString();
    }

    this.map.addListener("dragend", function () {
      getCoords();
    });
    
    this.map.addListener("zoom_changed", function () {
      getCoords();
    });

    
    if (this.list ) {

      this.latlngBounds = new window['google'].maps.LatLngBounds();

      let hasBounds = false;

      for( let i in this.list ){
        if( this.list[i].Lat ){
          hasBounds = true;
          this.latlngBounds.extend(new window['google'].maps.LatLng(parseFloat(this.list[i].Lat), parseFloat(this.list[i].Lon) ) );
        }
      };

      if( hasBounds ){
        this.map.fitBounds(this.latlngBounds);
        //this.map.zoom(11);
      }else{
        this.map.setCenter({
          lat: this.mapOptions.lat,
          lng: this.mapOptions.lng
        });
      }

    }else{
      this.map.setCenter({
        lat: this.mapOptions.lat,
        lng: this.mapOptions.lng
      });
    }


  }

  pathWatcher() { 
    let subscribe = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.path = this.router.url;
        this.lang = this.rootScope.get("lang");
      }
    );

    this.subscriptions = [...this.subscriptions, subscribe];
  }
  
  reset(mapRefresh: boolean = false) {
    

    if( mapRefresh ){
      this.boundsEnabled = true;
      this.getData(true);
    }else{
      this.boundsEnabled = false;
      this.offset = 0;
      this.list = false;
      this.listEnd = false;
      this.getData();
    }
    
  }

  changeView( view:String = "list" ) {
    this.view = view;
    sessionStorage.setItem("schools.view", view.toString());
    this.reset();
  }

  watchSearch() {

    let subscribe = this.route.queryParams.subscribe((params: ActivatedRoute) => {
      this.params = params;
      this.reset();
    });

    this.filterRetrieveParams( this.params );

    // Add subscription to main array for destroying
    this.subscriptions = [ ...this.subscriptions, subscribe];
  }

  fixCoordinates(entities) {

    let coordinates = [];

    for( var i in entities ){
      let item = entities[i];
      let lat = parseFloat( entities[i].Lat );
      let lon = parseFloat( entities[i].Lon );
      if( lat == null ){ continue; }

      let coords = lat+","+lon;

      if( coordinates.indexOf(coords) !== -1 ){
        entities[i].Lon = lon+0.0005;
      }
      coordinates.push(coords);

    }

    this.list = entities;
  }

  loadMore(){
    this.offset = this.list.length;
    this.loading = true;
    this.getData();
  }

  getData(mapRefresh:boolean = false) {

    this.loading = true;

    if( this.dataSubscription !== undefined ){
      this.dataSubscription.unsubscribe();
    }
    
    let types = [];
    if( this.params['type'] ){
      types = this.params['type'].split(",");
      if( this.params['subtype'] ){
        types.push(this.params['subtype'].split(",")[0]);
      }
    }

    let variables = {
      lang: this.lang.toUpperCase(),
      offset: this.offset,
      limit: this.view == "list" ? this.limit : this.mapLimit,
      title: this.params['title'] ? ""+this.params['title'].toLowerCase()+"" : "",
      boundsEnabled: this.boundsEnabled,
      minLat: this.bounds.minLat,
      maxLat: this.bounds.maxLat,
      minLon: this.bounds.minLon,
      maxLon: this.bounds.maxLon,
      location: this.params['location'] ? ""+this.params['location']+"" : "",
      locationEnabled: this.params['location'] ? true : false,
      type: this.params['type'] ? types :  [],
      typeEnabled: this.params['type'] ? true : false,
      language: this.params['language'] ? this.params['language'].split(",") :  [],
      languageEnabled: this.params['language'] ? true : false,
      ownership: this.params['ownership'] ? this.params['ownership'].split(",") :  [],
      ownershipEnabled: this.params['ownership'] ? true : false,
      specialClass: this.params['specialClass'] ? "1" :  "",
      specialClassEnabled: this.params['specialClass'] ? true : false,
      studentHome: this.params['studentHome'] ? "1" :  "",
      studentHomeEnabled: this.params['studentHome'] ? true : false,
    }

    this.dataSubscription = this.http.get('schoolMapQuery', { params: variables }).subscribe(data => {

      let entities = data['data']['CustomElasticQuery'];

      this.loading = false;
      
      if( entities.length < this.limit ){ this.listEnd = true; }

      if( this.view == "list" ){
        this.list = this.list ? [...this.list, ...entities] : entities;
      }else{
        this.fixCoordinates(entities);
      }
      

      this.dataSubscription.unsubscribe();
      
    });
    
  }

  getOptions() {

    let variables = {
      lang: this.lang.toUpperCase()
    };

    let subscription = this.http.get('getSchoolFilterOptions', {params:variables}).subscribe( (response) => {
      let data = response['data'];
      let entities = data['taxonomyTermQuery']['entities'];
      this.parseOptions(entities);

      const typeName = "TaxonomyTermEducationalInstitutionType";
      this.institutionTypes = entities.filter(elem => elem.__typename === typeName && !elem.parentId).map(elem => elem.entityId)
      subscription.unsubscribe();
    });
  }

  parseOptions(entities:any){

    entities = JSON.parse( JSON.stringify( entities ) );

    let options = {
      "reverseFieldTeachingLanguageNode": [],
      "reverseFieldOwnershipTypeNode": [],
      "reverseFieldEducationalInstitutionTyNode": []
    }

    for( let i in entities ){
      for( let key of Object.keys(entities[i]) ){
        if( options[key] ){
          entities[i]['count'] = entities[i][key]['count'];
          delete entities[i][key];
          delete entities[i]['__typename'];
          options[key].push(entities[i]);
        }
      }
    }

    this.languageOptions = options.reverseFieldTeachingLanguageNode;
    this.ownershipOptions = options.reverseFieldOwnershipTypeNode;
    this.typeOptions = options.reverseFieldEducationalInstitutionTyNode;

    this.filterFormItems.languages = this.params['languages'] || '';
    this.filterFormItems.types = this.params['types'] || '';
    this.filterFormItems.ownership = this.params['ownership'] || '';
  }

  ngOnInit() {

    this.mapOptions.styles = this.rootScope.get("mapStyles");
    
    this.showFilter = window.innerWidth > 1024;
    this.filterFull = window.innerWidth < 1024;

    this.pathWatcher();
    this.watchSearch();
    this.getOptions();

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