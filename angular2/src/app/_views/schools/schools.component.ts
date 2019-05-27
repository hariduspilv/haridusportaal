import { Component, OnDestroy, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FiltersService, DATEPICKER_FORMAT } from '@app/_services/filtersService';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/operator/map';

import { RootScopeService } from '@app/_services/rootScopeService';

import { HttpService } from '@app/_services/httpService';

/* Datepicker Imports */
import * as _moment from 'moment';
const moment = _moment;
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material";
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '@app/_services/settings.service';
import { ScrollRestorationService } from '@app/_services';

@Component({
  templateUrl: './schools.template.html',
  styleUrls: ['./schools.styles.scss'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: DATEPICKER_FORMAT},
  ]
})

export class SchoolsComponent extends FiltersService implements OnInit, OnDestroy{
  @ViewChild('content') content: ElementRef;

  dataSubscription: Subscription;
  parseFloat = parseFloat;
  showFilter: boolean;
  limit: number = 24;
  mapLimit: number = 3000;

  params: object;
  offset: number;
  list: any;
  listEnd: boolean;
  path: any;
  lang: any;

  public production: boolean = true;
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
  public scrollPositionSet: boolean = false;

  constructor(
    private rootScope: RootScopeService,
    public router: Router,
    public route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private http: HttpService,
    private settings: SettingsService,
    private translate: TranslateService,
    private scrollRestoration: ScrollRestorationService
  ) {
    super(null, null);
  }
  //why
  typesDropdownSort(e) {
    if(!e) {
      let selected = [];
      if(this.filterFormItems.type) {
        selected = this.typeOptions.filter(e => this.filterFormItems.type.find(x => e.entityId === x)).sort((a, b) => {
          if(a.entityLabel.toUpperCase() > b.entityLabel.toUpperCase()) {
            return 1;
          }
          return -1;
        });
      }
      let otherValues = this.typeOptions.filter(e => !selected.find(x => e.entityId === x.entityId)).sort((a, b) => {
        if(a.entityLabel.toUpperCase() > b.entityLabel.toUpperCase()) {
          return 1;
        }
        return -1;
      });
      this.validateSubtypes();
      if(selected.length === 0) {
        this.filterFormItems.subtype = '';
      }
      this.typeOptions = [...selected, ...otherValues];
    }
  }
  getSubTypes(){
    let output = [];
    if(this.filterFormItems.type) {
      output = this.typeOptions.filter(e => {
        return this.filterFormItems.type.find(x => {
          return e.parentId === parseInt(x);
        });
      });
    }
    if(output.length === 0) {
      this.params['subtype'] = [];
    }
    return output;
  }
  validateSubtypes() {
    if(this.filterFormItems.subtype) {
      const fullSelectedSubtypes = this.typeOptions.filter(e => this.filterFormItems.subtype.find(x => e.entityId === x));
      const validFilteredSubtypes = fullSelectedSubtypes.filter(e => this.filterFormItems.type.find(x => e.parentId === parseInt(x)));
      this.filterFormItems.subtype = this.filterFormItems.subtype.filter(e => validFilteredSubtypes.find(x => parseInt(e) === parseInt(x.entityId)));
    }
  }
  fillTypesBySubtype() {
    if(this.params['subtype']) {
      const fullSelectedSubtypes = this.typeOptions.filter(e => this.filterFormItems.subtype.find(x => e.entityId === x));;
      const typesOfSelectedSubtypes = this.typeOptions.filter(e => fullSelectedSubtypes.find(x => parseInt(e.entityId) === x.parentId));
      this.filterFormItems.type = typesOfSelectedSubtypes.map(e => e.entityId);
    }
  }
  //why
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
      const paramsKeys = Object.keys(params);
      let newParams = {};
      paramsKeys.forEach((e) => {
        switch (e) {
          case 'ownership':
          case 'language':
          case 'type':
          case 'subtype':
            newParams[e] = params[e].split(',');
            break;
          default:
            newParams[e] = params[e];
            break;
        }
      })
      this.params = newParams;
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
    
    // let types = [];
    // if( this.params['type'] ){
    //   types = [...this.params['type']];
    //   console.log(this.typeOptions);
    //   console.log(this.params['type']);
    //   if( this.params['subtype'] ){
    //     console.log(this.params['subtype']);
    //     types = [...types, ...this.params['subtype']];
    //   }
    // }

    //do some reverse search magic
    this.filterFull = this.params['subtype'] || this.params['type'] || this.params['ownership'] || this.params['specialClass'] || this.params['studentHome'] || this.params['language'];
    this.validateSubtypes();
    let types = [];
    if(this.params['subtype'] && this.params['type']) {
      const fullSubtypes = this.typeOptions.filter(e => this.params['subtype'].find(x => x === e.entityId));
      const cleanedTypes = this.params['type'].filter(e => !fullSubtypes.find(x => x.parentId === parseInt(e)));
      types = [...cleanedTypes, ...this.params['subtype']];
    } else if(this.params['type']){
      types = this.params['type'];
    }
    //fuck me
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
      type: types.length ? types :  [],
      typeEnabled: this.params['type'] ? true : false,
      language: this.params['language'] ? this.params['language']:  [],
      languageEnabled: this.params['language'] ? true : false,
      ownership: this.params['ownership'] ? this.params['ownership']:  [],
      ownershipEnabled: this.params['ownership'] ? true : false,
      specialClass: this.params['specialClass'] ? "1" :  "",
      specialClassEnabled: this.params['specialClass'] ? true : false,
      studentHome: this.params['studentHome'] ? "1" :  "",
      studentHomeEnabled: this.params['studentHome'] ? true : false,
    }

    this.initialScrollRestorationSetup(variables);
    
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
    this.watchSearch();
    this.filterFormItems.languages = this.params['languages'] || '';
    this.filterFormItems.types = this.params['types'] || '';
    this.filterFormItems.ownership = this.params['ownership'] || '';
    this.fillTypesBySubtype();
    this.typesDropdownSort(false);
  }

  ngOnInit() {

    if( this.settings.url == "https://htm.wiseman.ee" || this.settings.url == "http://test-htm.wiseman.ee:30000" ){
      this.production = false;
    }

    this.mapOptions.styles = this.rootScope.get("mapStyles");
    
    this.showFilter = window.innerWidth > 1024;
    this.filterFull = window.innerWidth < 1024;

    this.pathWatcher();
    this.getOptions();
  }
  
  ngOnDestroy() {
    /* Clear all subscriptions */
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
    if (this.scrollRestoration.scrollableRoutes.includes(this.scrollRestoration.currentRoute)) {
      this.scrollRestoration.setRouteKey('limit', this.limit + this.offset)
    }
  }

  initialScrollRestorationSetup(hash) {
    let scrollData = this.scrollRestoration.getRoute(decodeURI(window.location.pathname));
    if (scrollData && this.rootScope.get('scrollRestorationState') && this.view === 'list') {
      this.offset = !this.list && scrollData.limit ? scrollData.limit - this.limit : this.offset;
      hash['offset'] = !this.list ? 0 : this.offset;
      hash['limit'] = (!this.list && scrollData.limit) ? scrollData.limit : this.limit;
    }
  }

  ngAfterViewChecked() {
    if (!this.scrollPositionSet && this.content && this.content.nativeElement.offsetParent != null && this.view === 'list') {
      this.scrollRestoration.setScroll();
      this.scrollPositionSet = true;
      this.rootScope.set('scrollRestorationState', false);
    }
  }
}