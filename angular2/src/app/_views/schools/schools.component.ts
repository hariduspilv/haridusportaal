import { Component, OnDestroy, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FiltersService, DATEPICKER_FORMAT } from '../../_services/filters/filters.service';
import { ListQuery, OptionsQuery } from '../../_services/school/school.service';
import { Apollo, QueryRef } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription';
import { delay } from 'rxjs/operators/delay';

import { of } from 'rxjs/observable/of';

import 'rxjs/add/operator/map';

import { Observable } from 'rxjs/Observable';

import { RootScopeService } from '../../_services/rootScope/rootScope.service';

/* Datepicker Imports */
import * as _moment from 'moment';
const moment = _moment;
import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material";
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import { AgmCoreModule } from '@agm/core';


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
  mapLimit: Number = 100;

  params: object;
  offset: Number;
  list: any;
  listEnd: boolean;
  path: any;
  lang: any;

  boundsEnabled: boolean = false;

  view: any = localStorage.getItem("schools.view") || "list";

  loading: boolean = true;

  languageOptions = [];
  ownershipOptions = [];
  typeOptions = [];

  map: any;
  
  mapOptions = {
    lat: 58.8754705,
    lng: 24.5567241,
    zoom: 8,
    icon: "assets/marker.svg",
    clusterStyles: [
      {
          textColor: "#FFFFFF",
          url: "assets/cluster.svg",
          height: 50,
          width: 28
      }
    ]
  }

  bounds = {
    minLat: "0",
    maxLat: "99",
    minLon: "0",
    maxLon: "99"
  }

  subscriptions: Subscription[] = [];

  constructor(
    private rootScope: RootScopeService,
    public router: Router,
    public route: ActivatedRoute,
    private apollo: Apollo,
    private cdr: ChangeDetectorRef
  ) {
    super(null, null);
  }

  mapReady(map){

    let that = this;
    this.map = map;

    this.map.setCenter({
      lat: this.mapOptions.lat,
      lng: this.mapOptions.lng
    });

    this.map.setZoom(this.mapOptions.zoom);

    this.map.addListener("dragend", function () {
      let bounds = that.map.getBounds();
      that.bounds.minLat = bounds['f']['b'].toString();
      that.bounds.maxLat = bounds['f']['f'].toString();
      that.bounds.minLon = bounds['b']['b'].toString();
      that.bounds.maxLon = bounds['b']['f'].toString();

      that.reset(true);
    });
    
    this.map.addListener("zoom_changed", function () {
      let bounds = that.map.getBounds();
      that.bounds.minLat = bounds['f']['b'].toString();
      that.bounds.maxLat = bounds['f']['f'].toString();
      that.bounds.minLon = bounds['b']['b'].toString();
      that.bounds.maxLon = bounds['b']['f'].toString();

      that.reset(true);
    });

  }


  @HostListener('window:resize', ['$event'])
  onResize(){
    this.showFilter = window.innerWidth > 900;
    this.filterFull = window.innerWidth < 900;
  }

  setPaths() {
    this.rootScope.set('langOptions', {
      'en': '/en/school',
      'et': '/et/kool'
    });
  }

  pathWatcher() { 
    let subscribe = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.path = this.router.url;
        this.lang = params['lang'];
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
    localStorage.setItem("schools.view", view.toString());
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

    this.dataSubscription = this.apollo.watchQuery({
      query: ListQuery,
      variables: {
        lang: this.lang.toUpperCase(),
        offset: this.offset,
        limit: this.view == "list" ? this.limit : this.mapLimit,
        title: this.params['title'] ? "%"+this.params['title']+"%" : "%%",
        boundsEnabled: this.boundsEnabled,
        minLat: this.bounds.minLat,
        maxLat: this.bounds.maxLat,
        minLon: this.bounds.minLon,
        maxLon: this.bounds.maxLon,
        location: this.params['location'] ? "%"+this.params['location']+"%" : "%%",
        locationEnabled: this.params['location'] ? true : false,
        type: this.params['type'] ? this.params['type'].split(",") :  [],
        typeEnabled: this.params['type'] ? true : false,
        language: this.params['language'] ? this.params['language'].split(",") :  [],
        languageEnabled: this.params['language'] ? true : false,
        ownership: this.params['ownership'] ? this.params['ownership'].split(",") :  [],
        ownershipEnabled: this.params['ownership'] ? true : false,
        specialClass: this.params['specialClass'] ? "1" :  "",
        specialClassEnabled: this.params['specialClass'] ? true : false,
        studentHome: this.params['studentHome'] ? "1" :  "",
        studentHomeEnabled: this.params['studentHome'] ? true : false,
      },
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    }).valueChanges.subscribe( ({data}) => {

      this.loading = false;
      
      if( data['nodeQuery']['entities'].length < this.limit ){ this.listEnd = true; }

      if( mapRefresh ){
        this.list = data['nodeQuery']['entities'];
        this.cdr.detectChanges();

      }else{
        this.list = this.list ? [...this.list, ...data['nodeQuery']['entities']] : data['nodeQuery']['entities'];
      }

      this.dataSubscription.unsubscribe();

    });
  }

  getOptions() {
    let subscription = this.apollo.watchQuery({
      query: OptionsQuery,
      variables: {
        "lang": this.lang.toUpperCase()
      },
      fetchPolicy: 'no-cache',
      errorPolicy: 'none',
    }).valueChanges.subscribe( ({data}) => {
      let entities = data['taxonomyTermQuery']['entities'];
      this.parseOptions(entities);
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
          if( entities[i][key]['count'] == 1231230 ){ continue; }
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

    this.setPaths();
    this.onResize();
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