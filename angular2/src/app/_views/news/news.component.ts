import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FiltersService, DATEPICKER_FORMAT } from '@app/_services/filtersService';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/operator/map';

import { RootScopeService } from '@app/_services/rootScopeService';

/* Datepicker Imports */
import * as _moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material";
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import { HttpService } from '@app/_services/httpService';
import { ScrollRestorationService } from '@app/_services';

@Component({
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: DATEPICKER_FORMAT},
  ]
})

export class NewsComponent extends FiltersService implements OnInit, OnDestroy{
  @ViewChild('content') content: ElementRef;

  subscriptions: Subscription[] = [];

  limit = 24;
  path: any;
  lang: any;
  tags: any;
  params: any;
  listSubscription: any;
  list: any = false;
  offset: number = 0;
  listEnd: boolean = false;
  dataSubscription: any;
  loading = false;
  showFilter = true;
  public scrollPositionSet: boolean = false;

  constructor(
    private rootScope: RootScopeService,
    public router: Router,
    public route: ActivatedRoute,
    private http: HttpService,
    public scrollRestoration: ScrollRestorationService
  ) {
    super(null, null);
  }

  typesDropdownSort(e) {
    if(!e) {
      let selected = []
      if(this.filterFormItems.types) {
        selected = this.filterFormItems.types.sort((a,b) => {
          if(a.name.toUpperCase() > b.name.toUpperCase()) {
            return 1;
          }
          return -1;
        })
      }
      let otherValues = this.tags.filter((e) => {
        return !selected.find((x) => {
          return e.id === x.id
        })
      }).sort((a,b) => {
        if(a.name.toUpperCase() > b.name.toUpperCase()) {
          return 1;
        }
        return -1;
      })
      this.tags = [...selected, ...otherValues];
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

  processTags(tags: Array<object>) {
    //Process tags JSON for ng-select
    let output = [];
    
    for( let i in tags ){
      let current = tags[i];
      if( current['Tag'] && current['Tag'].length == 0 ){ continue; }

      for( let ii in current['Tag'] ){
        if (current['Tag'][ii]['entity']) {
          output.push({
            id: current['Tag'][ii]['entity']['entityId'],
            name: current['Tag'][ii]['entity']['entityLabel']
          });
        }
      }
    }

    return output;
  }

  getTags() {

    let variables = {
      lang: this.lang.toUpperCase()
    };
    
    let subscribe = this.http.get('getNewsTags', {params:variables}).subscribe( (response) => {
      let data = response['data'];
      let entities = (data['nodeQuery'] && data['nodeQuery']['entities']) || []
      let tags = this.processTags( entities );

      if( this.params.types !== undefined ){
        let splitParams = this.params.types.split(",");

        this.filterFormItems['types'] = [];

        for( let i in tags ){
          if( splitParams.indexOf(tags[i]['id']) !== -1 ){
            this.filterFormItems['types'].push(tags[i]);
          }
        }
      }

      this.tags = tags;
      this.typesDropdownSort(false);
      subscribe.unsubscribe();
    });

  }

  watchSearch() {

    let subscribe = this.route.queryParams.subscribe((params: ActivatedRoute) => {
      this.params = params;
      this.offset = 0;
      this.list = false;
      this.listEnd = false;
      this.getData();
    });

    this.filterRetrieveParams( this.params );

    // Add subscription to main array for destroying
    this.subscriptions = [ ...this.subscriptions, subscribe];
  }

  loadMore() {
    this.offset = this.list.length;
    this.loading = true;
    this.getData();
  }

  getData() {

    if( this.params.dateFrom ){
      let splitDate = this.params.dateFrom.split("-");
      var dateFromUnix:any = new Date(splitDate[2] + "-" + splitDate[1] + "-" + splitDate[0] + "T00:00:00Z").getTime()/1000;
      dateFromUnix = dateFromUnix.toString();
    }

    if( this.params.dateTo ){
      let splitDate = this.params.dateTo.split("-");
      var dateToUnix:any = new Date(splitDate[2] + "-" + splitDate[1] + "-" + splitDate[0] + "T23:59:59Z").getTime()/1000;
      dateToUnix = dateToUnix.toString();
    }

    let variables = {
      tagValue: this.params.types ? this.params.types.split(",") : "",
      tagEnabled: this.params.types ? true : false,
      titleValue: "%"+(this.params.title || '')+"%",
      titleEnabled: this.params.title ? true : false,
      minDate: this.params.dateFrom ? dateFromUnix : "-2147483647",
      maxDate: this.params.dateTo ? dateToUnix :"2147483647",
      lang: this.lang.toUpperCase(),
      offset: this.offset,
      limit: this.limit
    };

    this.initialScrollRestorationSetup(variables);
    
    let subscribe = this.http.get('newsList', {params:variables}).subscribe( (response) => {
      let data = response['data'];
      this.loading = false;
      if( data['nodeQuery']['entities'].length == 0 ){
        if( !this.list || this.list.length == 0 ){
          this.list = [];
        }
        this.listEnd = true;
        return false;
      }
      if( data['nodeQuery']['entities'].length < this.limit ){ this.listEnd = true; }

      if( this.list ){
        this.list = [...this.list, ...data['nodeQuery']['entities']];
      }
      else{
        this.list = data['nodeQuery']['entities'];
      }


      subscribe.unsubscribe();
    });
  }

  ngOnInit() {
    if (window.innerWidth <= 1024) {
      this.filterFull = true;
      this.showFilter = false;
    }

    this.pathWatcher();
    
    this.getTags();

    this.watchSearch();
    if(this.params.types) {
      this.filterFull = true;
    }
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
    let scrollData = this.scrollRestoration.getRoute(window.location.pathname);
    if (scrollData && this.rootScope.get('scrollRestorationState')) {
      this.offset = !this.list && this.scrollRestoration.getRouteKey('limit') ? this.scrollRestoration.getRouteKey('limit') - this.limit : this.offset;
      hash['offset'] = !this.list ? 0 : this.offset;
      hash['limit'] = (!this.list && this.scrollRestoration.getRouteKey('limit')) ? this.scrollRestoration.getRouteKey('limit') : this.limit;
    }
  }

  ngAfterViewChecked() {
    if (!this.scrollPositionSet && this.content && this.content.nativeElement.offsetParent != null) {
      this.scrollRestoration.setScroll();
      this.scrollPositionSet = true;
      this.rootScope.set('scrollRestorationState', false);
    }
  }
}