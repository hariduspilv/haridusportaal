import { NgSelectModule } from '@ng-select/ng-select';
import { Component, OnDestroy, ViewChild, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { EventsConfig } from './events-config.model';
import { EventsService, RootScopeService } from '../../_services';
import { sortEventsByOptions, getEventsTags } from '../../_services/events/events.graph';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { delay, map } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/observable/of';

import { Apollo, QueryRef } from 'apollo-angular';
import { GroupByPipe } from '../../_pipes/groupBy.pipe';



import { FiltersService, DATEPICKER_FORMAT } from '../../_services/filters/filters.service';

import * as _moment from 'moment';
const moment = _moment;
import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material";
import { MomentDateAdapter } from '@angular/material-moment-adapter';

@Component({
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: DATEPICKER_FORMAT},
  ]
})

export class EventsComponent extends FiltersService implements OnInit, OnDestroy{
  
  subscriptions: Subscription[] = [];
  
  // ALL PAGE CONFIG
  path: string;
  lang: string;
  eventList: any;
  eventListByDates: any;
  view: string;
  calendarDays: any;

  eventsTags: any;
  eventsTagsObs: any;

  eventsTypes: any;
  eventsTypesObs: any;

  eventsConfig: EventsConfig = new EventsConfig();

  dataSubscription: any;
  
  status: boolean = false;

  listEnd: boolean = false;
  error: boolean = false;
  showFilter = true;
  
  current: object;
  
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private apollo: Apollo,
    private rootScope: RootScopeService,
    private eventService: EventsService
  ) {
    super(null, null);
  }
  
  setPaths() {
    this.rootScope.set('langOptions', {
      'en': '/en/events',
      'et': '/et/sundmused'
    });
  }
  
  date: any = new Date();
  year: number = this.date.getFullYear();
  month: any = this.date.getMonth() + 1;
  monthName: string = moment(this.date).format('MMMM');
  popup: number = null;
  morePopup: number = null;
  params: any;
  

  togglePopup(i) {this.morePopup = null;this.popup = i;}
  closePopup() {this.popup = null;}
  toggleMore(day) {this.popup = null;this.morePopup = day;}
  closeMore() {this.morePopup = null;}

  changeMonth(direction:number) {
    let month = parseInt( this.month );
    
    if( direction == 1 ){
      month++;
    }else{
      month--;
    }
    
    if( month > 12 ){
      this.year++;
      this.month = 1;
    }
    else if( month < 1 ){
      this.year--;
      this.month = 12;
    }else{
      this.month = month;
    }

    
    this.monthName = moment(this.year+"/"+this.month, "YYYY/M").format('MMMM');

    this.status = false;
    this.calendarDays = false;
    this.generateCalendar();

    this.getData();
  }

  getDayName(day:any) {

    return moment(this.year+"-"+this.month+"-"+day, "YYYY-M-DD").format("dddd").toLowerCase();
  }
  
  getDay(date:any) {
    return moment(date, "DD.MM.YYYY").format("dddd").toLowerCase();
  }
  
  generateCalendar() {
    
    
    if( this.filterFormItems.dateFrom ){
      console.log(this.filterFormItems.dateFrom);
    }
    this.month = parseInt(this.month);
    
    if( this.month < 10 ){ this.month = "0"+this.month; }
    
    let dateObj = moment(this.year+'-'+this.month+'-01');
    
    let props = {
      days: dateObj.daysInMonth(),
      firstDay: dateObj.day()
    }
    
    let calendar = {};
    
    let weekCounter = 1;
    let dayList = [7,1,2,3,4,5,6];
    let dayCounter = dayList[props.firstDay];
    
    for( let i = 1; i < props.days+1; i++ ){
      if( dayCounter > 7 ){ weekCounter++; dayCounter = 1; }
      
      if( !calendar[weekCounter] ){ calendar[weekCounter] = []; }
      
      calendar[weekCounter].push({
        i: i,
        events: []
      });
      
      dayCounter++;
    }
    
    this.calendarDays = [];
    
    for( let i in calendar ){
      this.calendarDays.push(calendar[i]);
    }
    
    let prependDates = (this.calendarDays[0].length - 7) * (-1);
    
    if( prependDates > 0 ){
      for( let i = 0; i < prependDates; i++ ){
        this.calendarDays[0].unshift("");
      }
    }
    
    let appendDates = 7 - dayCounter + 1;
    
    if( appendDates > 0 ){
      for( let i = 0; i < appendDates; i++ ){
        this.calendarDays[ this.calendarDays.length - 1 ].push("");
      }
    }
    
  }
  
  changeView(view: any, update: boolean = true){
    this.view = view;
    
    if( view == "calendar" ){
      this.eventsConfig.limit = 9999;
      this.eventService.getCalendar(2018, 7);
      this.generateCalendar();
    }else{
      this.eventsConfig.limit = 5;
    }

    if( update ){
      this.status = false;
      this.listEnd = false;
      this.eventList = false;
      this.eventListByDates = false;
      this.getData();
    }
  }


  loadMore() {
    this.eventsConfig.offset = this.eventList.length;
    var subscriber = this.route.queryParams.subscribe(
      (params: ActivatedRoute) => {
        this.apollo.watchQuery({
          query: sortEventsByOptions,
          variables: this.eventsConfig.getApollo(this.lang.toUpperCase()),
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        }).valueChanges.subscribe(({data, loading}) => {
          subscriber.unsubscribe();
          this.eventList = this.eventList.concat(data['nodeQuery']['entities']);
          this.eventListByDates = this.eventList.filter(event => {
            const dates = event.eventDates.map(d => moment(d.entity.fieldEventDate.unix * 1000))
            return moment(moment.min(dates)).isAfter()
          }).map((event) => { 
            const dates = event.eventDates
              .map(d => moment(d.entity.fieldEventDate.unix * 1000))
            const dateUnix = moment.min(dates)
            return {
              day: moment(dateUnix).format("DD.MM"),
              monthYear: moment(dateUnix).format("MMMM.YYYY"),
              date: moment(dateUnix).format("DD.MM.YYYY"),
              event
            }
          });
          if ( data['nodeQuery']['entities'] && (data['nodeQuery']['entities'].length < this.eventsConfig.limit) ){
            this.listEnd = true;
          }
        });        
      }
    )
  }
  
  ngOnInit() {
    
    this.changeView("list", false);
    
    this.setPaths();
    
    var currMonthName  = moment().format('MMMM');

    let month:any = moment().format("M");
    if( month < 10 ){ month = "0"+month;}
    this.current = {
      date: moment().format("DD.MM.YYYY"),
      day: moment().format("D"),
      dayString: moment().format("DD"),
      month: month,
      year: moment().format("YYYY")
    }

    // SUBSCRIBE TO QUERY PARAMS
    this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.path = this.router.url;
        this.lang = params['lang'];
      }
    );

    this.route.queryParams.subscribe( (params: Params) => {
      this.params = params;
      this.eventList = false;
      this.eventListByDates = false;
      this.listEnd = false;
      this.status = false;
      this.getData();
    });

    this.getTags();

    this.filterRetrieveParams( this.params );

    //this.getData();
    if (window.innerWidth <= 900) {
      this.filterFull = true;
      this.showFilter = false;
    }
  }
  sort(prop:any, arr:any) {
    prop = prop.split('.');
    var len = prop.length;

    arr.sort(function (a, b) {
        var i = 0;
        while( i < len ) { a = a[prop[i]]; b = b[prop[i]]; i++; }
        if (a < b) {
            return -1;
        } else if (a > b) {
            return 1;
        } else {
            return 0;
        }
    });
    return arr;
  }

  dataToCalendar(list:any) {

    list = JSON.parse( list );
    
    for( let i in list ){
      let current = list[i];
      let eventDate = current['eventDates'][0]['entity']['fieldEventDate']['value'];
      let dateString = this.year+"-"+this.month+"-";
      
      let set = false;

      for( var ii in current['eventDates'] ){
        let eventDate = current['eventDates'][ii]['entity']['fieldEventDate']['value'];
        if( set ){ break; }
        for( var o in this.calendarDays ){
          if( set ){ break; }
          for( var oo in this.calendarDays[o] ){
            if( dateString+this.calendarDays[o][oo]['i'] == eventDate ){
              this.calendarDays[o][oo]['events'].push( current );
              set = true;
              break;
            }
          }
        }
      }
    }
  }

  parseDay(day:any){

    if( day.events && day.events.length > 0 ){

      for( var i in day.events ){
        let current = day.events[i];
        current['startTime'] = 0;

        var eventDates = current.eventDates;
        for( var ii in eventDates ){
          let entity = eventDates[ii]['entity'];

          if( entity['fieldEventDate']['value'] == this.year+"-"+this.month+"-"+day['i'] ){
            if( entity['fieldEventStartTime'] > current['startTime'] ){
              current['startTime'] = eventDates[ii]['entity']['fieldEventStartTime'];
            }
          }
          
        }

      }

      day.events = this.sort("startTime", day.events);
      return day.events;
    }else{
      return day.events;
    }

  }

  getData() {
    
        this.eventsConfig = new EventsConfig();

        console.log("I NEED DATA");
        // TITLE
        if(this.params['title']){
          this.eventsConfig.titleEnabled = true;
          this.eventsConfig.titleValue = this.params['title']
        }

        if( this.view == "list" ){

          // DATE FROM
          if(this.params['dateFrom'] && moment(this.params['dateFrom'], 'DD-MM-YYYY').isValid()){
            this.eventsConfig.dateFrom = moment(this.params['dateFrom'], 'DD-MM-YYYY').format('YYYY-MM-DD').toString();
          }
          // DATE TO
          if(this.params['dateTo'] && moment(this.params['dateTo'], 'DD-MM-YYYY').isValid()){
            this.eventsConfig.dateTo = moment(this.params['dateTo'], 'DD-MM-YYYY').format('YYYY-MM-DD').toString();
          }
        }else{
          this.eventsConfig.dateFrom = moment("01-"+this.month+"-"+this.year, 'DD-MM-YYYY').startOf("month").format('YYYY-MM-DD').toString();
          this.eventsConfig.dateTo = moment("01-"+this.month+"-"+this.year, 'DD-MM-YYYY').endOf("month").format('YYYY-MM-DD').toString();
          this.eventsConfig.limit = 999;
          this.eventsConfig.offset = 0;
        }
        // TAGS
        if(this.params['tags'] && this.params['tags'] !== null){
          this.eventsConfig.tagsEnabled = true;
          this.eventsConfig.tagsValue = this.params['tags'].split(',')
        }
        // TYPE
        if(this.params['types'] && this.params['types'] !== null){
          this.eventsConfig.typesEnabled = true;
          this.eventsConfig.typesValue = this.params['types'].split(',')
        }
        
        if( this.dataSubscription ){
          this.dataSubscription.unsubscribe();
        }

        // GET LIST OBSERVABLE
        this.dataSubscription= this.apollo.watchQuery<any>({
          query: sortEventsByOptions,
          variables: this.eventsConfig.getApollo(this.lang.toUpperCase()),
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        }).valueChanges.subscribe(({data}) => {

          if( this.status ){ return false; }

          this.status = true;

          this.dataSubscription.unsubscribe();
          this.dataSubscription = false;


          if( this.view == "list" ){
            this.eventList = data['nodeQuery']['entities'];
            this.eventListByDates = this.eventList.filter(event => {
              const dates = event.eventDates.map(d => moment(d.entity.fieldEventDate.unix * 1000))
              return moment(moment.min(dates)).isAfter()
            }).map((event) => {
              const dates = event.eventDates.map(d => moment(d.entity.fieldEventDate.unix * 1000))
              const dateUnix = moment.min(dates)
              return {
                day: moment(dateUnix).format("DD.MM"),
                monthYear: moment(dateUnix).format("MMMM.YYYY"),
                date: moment(dateUnix).format("DD.MM.YYYY"),
                event
              }
            });
            if (this.eventList && (this.eventList.length < this.eventsConfig.limit)){
              this.listEnd = true;
            }
          }else{
            this.dataToCalendar( JSON.stringify( data['nodeQuery']['entities'] ) );
          }
        });
  }

  getTags() {
    let tagSubscription = this.apollo.watchQuery({
      query: getEventsTags,
      variables: {
        lang: this.lang.toUpperCase(),
      },
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    }).valueChanges
    .subscribe(({data}) => {
      
      this.eventsTags = data['CustomTagsQuery']['entities']
        .filter(entity => entity.entityBundle === 'tags')
        .map((entity) => {return { id: entity.entityId, name: entity.entityLabel }});
      this.eventsTypes = data['CustomTagsQuery']['entities']
        .filter(entity => entity.entityBundle === 'event_type')
        .map((entity) => {return { id: entity.entityId, name: entity.entityLabel }});

      if( this.params.tags !== undefined ){
        let splitParams = this.params.tags.split(",");
        this.filterFormItems['tags'] = [];
        for( let i in this.eventsTags ){
          if( splitParams.includes(this.eventsTags[i]['id'])){
            this.filterFormItems['tags'].push(this.eventsTags[i]);
          }
        }
      }
      let tags = this.eventsTags.filter((thing, index, self) =>
      index === self.findIndex((t) => (
        t.id === thing.id && t.name === thing.name
      )))

      if( this.params.types !== undefined ){
        let splitParams = this.params.types.split(",");
        this.filterFormItems['types'] = [];
        for( let i in this.eventsTypes ){
          if( splitParams.includes(this.eventsTypes[i]['id'])){
            this.filterFormItems['types'].push(this.eventsTypes[i]);
          }
        }
      }
      let types = this.eventsTypes.filter((thing, index, self) =>
      index === self.findIndex((t) => (
        t.id === thing.id && t.name === thing.name
      )))

      this.eventsTagsObs = of(tags).pipe();
      this.eventsTypesObs = of(types).pipe();
    });

    this.subscriptions = [...this.subscriptions, tagSubscription];
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(event){
    this.showFilter = event.target.innerWidth > 900;
    this.filterFull = event.target.innerWidth < 900;
  }
  
  ngOnDestroy() {
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
  
  parseIntoReadableTime(milliseconds){
    //Get hours from milliseconds
    var hours = milliseconds / (1000*60*60);
    var absoluteHours = Math.floor(hours);
    var h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours;
    
    //Get remainder from hours and convert to minutes
    var minutes = (hours - absoluteHours) * 60;
    var absoluteMinutes = Math.floor(minutes);
    var m = absoluteMinutes > 9 ? absoluteMinutes : '0' +  absoluteMinutes;
    
    //Get remainder from minutes and convert to seconds
    var seconds = (minutes - absoluteMinutes) * 60;
    var absoluteSeconds = Math.floor(seconds);
    
    return h + ':' + m;
  }
}
