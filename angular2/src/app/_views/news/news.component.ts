import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FiltersService, DATEPICKER_FORMAT } from '../../_services/filters/filters.service';
import { Apollo, QueryRef } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription';
import { delay } from 'rxjs/operators/delay';

import { of } from 'rxjs/observable/of';

import 'rxjs/add/operator/map';

import { Observable } from 'rxjs/Observable';

import { RootScopeService } from '../../_services/rootScope/rootScope.service';
import { getNewsTags2, sortByOptions } from '../../_services/news/news.graph';

/* Datepicker Imports */
import * as _moment from 'moment';
const moment = _moment;
import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material";
import { MomentDateAdapter } from '@angular/material-moment-adapter';

@Component({
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: DATEPICKER_FORMAT},
  ]
})

export class NewsComponent extends FiltersService implements OnInit, OnDestroy{

  subscriptions: Subscription[] = [];

  limit = 5;
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

  constructor(
    private rootScope: RootScopeService,
    public router: Router,
    public route: ActivatedRoute,
    private apollo: Apollo
  ) {
    super(null, null);
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

  setPaths() {
    this.rootScope.set('langOptions', {
      'en': '/en/news',
      'et': '/et/uudised'
    });
  }

  processTags(tags: Array<object>) {
    //Process tags JSON for ng-select
    let output = [];
    
    for( let i in tags ){
      let current = tags[i];
      if( current['Tag'].length == 0 ){ continue; }

      for( let ii in current['Tag'] ){
        output.push({
          id: current['Tag'][ii]['entity']['entityId'],
          name: current['Tag'][ii]['entity']['entityLabel']
        });
      }
    }

    return output;
  }

  getTags() {
    let subscribe = this.apollo.watchQuery({
      query: getNewsTags2,
      variables: {
        lang: this.lang.toUpperCase(),        
      },
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    }).valueChanges
    .subscribe(({data}) => {
      let entities = data['nodeQuery']['entities'];
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

      this.tags = of(tags).pipe(delay(500));

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
    
    let subscribe = this.apollo.watchQuery({
      query: sortByOptions,
      variables: {
        tagValue: this.params.types ? this.params.types.split(",") : "",
        tagEnabled: this.params.types ? true : false,
        titleValue: "%"+(this.params.title || '')+"%",
        titleEnabled: this.params.title ? true : false,
        minDate: this.params.dateFrom ? dateFromUnix : "-2147483647",
        maxDate: this.params.dateTo ? dateToUnix :"2147483647",
        lang: this.lang.toUpperCase(),
        offset: this.offset,
        limit: this.limit
      },
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    }).valueChanges.subscribe( ({data}) => {

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

    this.pathWatcher();

    this.setPaths();

    this.getTags();

    this.watchSearch();

    if (window.innerWidth <= 900) {
      this.filterFull = true;
      this.showFilter = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event){
    this.showFilter = event.target.innerWidth > 900;
    this.filterFull = event.target.innerWidth < 900;
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