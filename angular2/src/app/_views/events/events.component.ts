import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';


import { EventsService, RootScopeService } from '../../_services';
import { sortEventsByOptions, getEventsTags, getEventsTypes } from '../../_services/events/events.graph';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { delay, map } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/observable/of';

import { Apollo, QueryRef } from 'apollo-angular';

import * as _moment from 'moment';

const moment = _moment;

@Component({
  templateUrl: './events.component.html',
})

export class EventsComponent implements OnInit, OnDestroy {
  
  subscriptions: Subscription[] = [];
  
  // ALL PAGE CONFIG
  path: string;
  lang: string;
  eventList: any;
  view: string;
  calendarDays: any;
  
  // Events config
  tagValue: string = "";
  tagEnabled: boolean = false;
  tidValue: string = "";
  tidEnabled: boolean = false;
  titleValue: string = "";
  titleEnabled: boolean = false;
  minDate: string = moment().format('YYYY-MM-DD').toString(); //"1901-00-00" TODAY
  maxDate: string = moment("2038-01-01").format('YYYY-MM-DD').toString(); //"2038-01-01"
  offset: number = 0;
  limit: number = 3;
  
  // datepicker validation
  datepickerMin: Date;
  datepickerMax: Date;
  
  filter: boolean = true;
  filterState: boolean = false;
  listEnd: boolean = false;
  error: boolean = false;
  
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apollo: Apollo,
    private rootScope: RootScopeService,
    private eventService: EventsService
  ) { }
  
  setPaths() {
    this.rootScope.set('langOptions', {
      'en': '/en/events',
      'et': '/et/sundmused'
    });
  }
  
  loadMore() {
    this.offset = this.eventList.length;
    const paramsSub = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.path = this.router.url;
        this.lang = params['lang'];
        
        const querySubscription = this.apollo.watchQuery({
          query: sortEventsByOptions,
          variables: {
            tagValue: this.tagValue, //?
            tagEnabled: this.tagEnabled, //?
            tidValue: this.tidValue, //?
            tidEnabled: this.tidEnabled, //?
            titleValue: "%" + this.titleValue + "%", //?
            titleEnabled: this.titleEnabled, //?
            minDate: this.minDate, //?
            maxDate: this.maxDate, //?
            lang: this.lang.toUpperCase(), //?
            offset: this.offset, //?
            limit: this.limit, //?   
          },
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        }).valueChanges.subscribe(({data, loading}) => {
          this.eventList = this.eventList.concat(data['nodeQuery']['entities']);
          if ( data['nodeQuery']['entities'] && (data['nodeQuery']['entities'].length < this.limit) ){
            this.listEnd = true;
          }
        });        
        this.subscriptions = [...this.subscriptions, querySubscription];
      }
    )
    this.subscriptions = [...this.subscriptions, paramsSub];
  }
  
  year: number = 2018;
  month:any = 7;
  
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
    
    
    this.generateCalendar();
  }
  
  generateCalendar() {
    
    
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
      
      calendar[weekCounter].push(i);
      
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
  
  changeView(view: any){
    this.view = view;
    
    if( view == "calendar" ){
      this.limit = 9999;
      this.eventService.getCalendar(2018, 7);
      this.generateCalendar();
    }else{
      this.limit = 3;
    }
  }
  
  ngOnInit() {
    
    this.changeView("list");
    
    this.setPaths();
    
    var currMonthName  = moment().format('MMMM');
    console.log(currMonthName);
    
    
    const paramsSub = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.path = this.router.url;
        this.lang = params['lang'];
      }
    )
    this.subscriptions = [...this.subscriptions, paramsSub];
    
    // GET LIST OBSERVABLE
    const eventsSubscription = this.apollo.watchQuery<any>({
      query: sortEventsByOptions,
      variables: {
        tagValue: this.tagValue, //?
        tagEnabled: this.tagEnabled, //?
        tidValue: this.tidValue, //?
        tidEnabled: this.tidEnabled, //?
        titleValue: "%" + this.titleValue + "%", //?
        titleEnabled: this.titleEnabled, //?
        minDate: this.minDate, //?
        maxDate: this.maxDate, //?
        lang: this.lang.toUpperCase(), //?
        offset: this.offset, //?
        limit: this.limit, //?
      },
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    }).valueChanges.subscribe(({data}) => {
      this.eventList = data['nodeQuery']['entities'];
      if (this.eventList && (this.eventList.length < this.limit)){
        this.listEnd = true;
      }
    });
    this.subscriptions = [...this.subscriptions, eventsSubscription];
  
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
