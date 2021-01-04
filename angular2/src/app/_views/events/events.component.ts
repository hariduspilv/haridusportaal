import { NgSelectModule } from '@ng-select/ng-select';
import { Component, OnDestroy, ViewChild, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, Params, NavigationEnd } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { EventsConfig } from './events-config.model';
import { RootScopeService, ScrollRestorationService } from '@app/_services';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { delay, map, filter } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/observable/of';

import { HttpService } from '@app/_services/httpService';
import { FiltersService, DATEPICKER_FORMAT } from '@app/_services/filtersService';

import * as _moment from 'moment';
const moment = _moment;
import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material";
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: DATEPICKER_FORMAT},
  ]
})

export class EventsComponent extends FiltersService implements OnInit, OnDestroy{
  @ViewChild('content') content: ElementRef;

  objectKeys = Object.keys;
  parseInt = parseInt;

  subscriptions: Subscription[] = [];
  
  // ALL PAGE CONFIG
  path: string;
  lang: string = this.rootScope.get("lang");;
  eventList: any = false;
  eventListRaw: any;
  view: string;
  calendarDays: any;
  loadingCalendar: boolean = false;
  calendarDataEntries: any;
  eventsTags: any;
  eventsTagsSet: any;
  eventsTagsObs: any;

  loadFlag: boolean = false;

  eventsTypes: any;
  eventsTypesSet: any;
  eventsTypesObs: any;

  eventsConfig: EventsConfig = new EventsConfig();

  dataSubscription: any;
  
  status: boolean = false;

  listEnd: boolean = false;
  error: boolean = false;
  showFilter: boolean = true;
  
  current: object;

  visibleEntries = 3;

  scrollPositionSet: boolean = false;
  count: number = 0;
  private filterFullProperties: any = ['tags', 'types'];
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private rootScope: RootScopeService,
    private http: HttpService,
    public scrollRestoration: ScrollRestorationService,
    public device: DeviceDetectorService
  ) {
    super(null, null);
    let subscription = router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if((/^\/sündmused\/kalender/g).test(decodeURI(event.url)) && window.innerWidth > 1024) {
        this.changeView('calendar', true);
      } else {
        this.changeView('list', true);
      }
    });
    this.subscriptions = [...this.subscriptions, subscription];
  }
  
  date: any = new Date();
  year: number = this.date.getFullYear();
  month: any = this.date.getMonth() + 1;
  monthName: string = moment(this.date).format('MMMM');
  popup: number = null;
  morePopup: number = null;
  params: any = {};
  

  togglePopup(i) {
    if( this.popup == i ){ this.popup = null; return false;}
    this.morePopup = null;
    this.popup = i;
  }
  closePopup() {this.popup = null;}
  toggleMore(day) {this.popup = null;this.morePopup = day;}
  closeMore() {this.morePopup = null;}

  @HostListener('window:resize', ['$event'])
  onResize(event){
    if( window.innerWidth < 1024 && this.view == "calendar" ){
      this.changeView("list");
    }
  }

  changeMonth(direction:number) {
    this.loadingCalendar = true;
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

    this.status = false;
    this.calendarDays = false;
    this.generateCalendar();

    this.getData();
  }

  getMonthName(month:any) {
    return moment("2018-"+month+"-01", "YYYY-M-DD").format("MMMM").toLowerCase();
  }

  getDayName(year, month:any, day:any, isUnix:boolean = false) {

    if( month < 10 ){month = "0"+month;}
    
    if( isUnix ){
      return moment.unix(day/1000).format("dddd").toLowerCase();
    }else{
      return moment(year+"-"+month+"-"+day, "YYYY-M-DD").format("dddd").toLowerCase();
    }
  }
  
  generateCalendar(urlDate:boolean = false) {
    
    if( this.filterFormItems.dateFrom && urlDate){
      this.month = moment(this.filterFormItems.dateFrom, "DD-MM-YYYY").format("M");
    }else{
      this.month = parseInt(this.month);
    }

    this.monthName = moment(this.year+"/"+this.month, "YYYY/M").format('MMMM');
    
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
        sessionStorage.setItem("events.view", view);
    switch(view) {
      case 'calendar':
        this.router.navigate(['/sündmused/kalender'], {queryParamsHandling: "preserve"});
        break;
      case 'list':
        this.router.navigate(['/sündmused'], {queryParamsHandling: "preserve"});
      default:
        break;
    }
    if( view == "calendar" ){
      this.loadingCalendar = true;
      this.eventsConfig.limit = 9999;
      this.generateCalendar(true);
    }else{
      this.eventsConfig.limit = 24;
    }
    if( update ){
      this.status = false;
      this.eventList = false;
      this.getData();
    }

  }

  loadMore() {

    this.loadFlag = true;

    this.eventsConfig.offset = this.eventListRaw.length;
  
    let variables = this.eventsConfig.getApollo(this.lang.toUpperCase());

    variables['timeEnabled'] = false;
    
    let subscriber = this.http.get('getEventList', {params: variables}).subscribe((response) => {
      
      this.loadFlag = false;
      let data = response['data'];

      this.count = data['nodeQuery']['count'];
      this.eventListRaw = this.eventListRaw.concat(data['nodeQuery']['entities']);
      this.eventList = this.organizeList( this.eventListRaw );

      // if ( data['nodeQuery']['entities'] && (data['nodeQuery']['entities'].length < this.eventsConfig.limit) ){
      //   this.listEnd = true;
      // }
      if (this.eventListRaw && this.eventListRaw.length === this.count) {
        this.listEnd = true;
      }
      subscriber.unsubscribe();
    });
  }
  
  ngOnInit() {
    this.loadingCalendar = true;
    // SUBSCRIBE TO QUERY PARAMS
    this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.path = this.router.url;
      }
    );
    //kui jegorr teeb õhtusöögiks 5 kilo spagette, siis sul ei jää muud üle kui hommikusöögiks veel spagette süüa
    if((/^\/sündmused\/kalender/g).test(decodeURI(this.path)) && window.innerWidth > 1024) {
      this.changeView('calendar', false);
    } else {
      this.changeView('list', false);
    }

    this.showFilter = this.device.isDesktop();
    this.filterFull = this.device.isTablet() || this.device.isMobile();
    
    var currMonthName  = moment().format('MMMM');

    let month:any = moment().format("M");
    if( month < 10 ){ month = "0"+month;}
    this.current = {
      day: moment().format("D"),
      dayString: moment().format("DD"),
      month: month,
      year: parseInt(moment().format("YYYY"))
    }  
    this.route.queryParams.subscribe( (params: Params) => {
      this.params = params;
      this.eventList = false;
      this.listEnd = false;
      this.status = false;
      this.filterRetrieveParams(params);
      this.generateCalendar();
      this.getData();
      
    });

    this.getTags();
    this.getTypes();

    this.filterRetrieveParams( this.params );
    //this.getData();
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

  organizeList(data:any) {
    
    let list = JSON.parse( JSON.stringify(data) );

    let tmpList = {};

    for( var i in list ){
      let entry = list[i];

      let earliest = entry['fieldEventMainDate']['unix'];
      let timeEarliest;

/*
      for( var ii in entry['eventDates'] ){
        let event = entry['eventDates'][ii]['entity'];
        let unix = parseInt( event['fieldEventDate']['unix'] );
        let time = parseInt( event.fieldEventStartTime );

        if( !earliest ){ earliest = unix; }
        else if( earliest > unix ){ earliest = unix; }

        if( !timeEarliest ){ timeEarliest = time; }
        else if( timeEarliest > time ){ timeEarliest = time; }
      }
      */
      
      entry['firstEventTime'] = entry['fieldEventMainStartTime'];
      entry['firstEventUnix'] = entry['fieldEventMainDate']['unix'];
     
      let year = moment.unix( earliest ).format("YYYY").toString();
      let month = moment.unix( earliest ).format("M").toString();
      let day = moment.unix( earliest ).format("D").toString();

      if( !tmpList[year] ){ tmpList[year] = {}; }
      if( !tmpList[year][month] ){ tmpList[year][month] = {}; }
      if( !tmpList[year][month][day] ){ tmpList[year][month][day] = []; }
      tmpList[year][month][day].push(entry);

    }

    /*
    for( let year in tmpList ){// loop through years
      for( let month in tmpList[year] ){// loop through months
        for( let day in tmpList[year][month] ){// loop through days
          tmpList[year][month][day] = this.sort("firstEventUnix", tmpList[year][month][day]);
        }
      }
    }
    */
    
    return tmpList;
  }

  formatNumber(input:number){
    let output:any = input;

    if( input < 10 ){ output = "0"+output; }
    return output;
  }

  dataToCalendar(list:any) {

    list = JSON.parse( list );
    
    this.calendarDataEntries = list.length;
    
    for( let i in list ){
      let current = list[i];
      let eventDate = moment(current['fieldEventMainDate']['unix']*1000).format("YYYY-MM-DDz");
      let dateString = this.year+"-"+this.month+"-";
      

      for( var o in this.calendarDays ){
        for( var oo in this.calendarDays[o] ){
          
          let day:any = parseInt(this.calendarDays[o][oo]['i']);
          if( day < 10 ){ day = "0"+day; }

          if( dateString+day == eventDate ){
            this.calendarDays[o][oo]['events'].push( current );
            break;
          }
        }
      }
    }
    this.loadingCalendar = false;
  }

  maxEntries( day:any ){
    
    let max = this.visibleEntries;
    let total = day.events.length;
    let amount = max;
    if( total > max ){
      amount = max - 1;
    }
    return amount;
  }

  parseDay(day:any){

    if( day.events && day.events.length > 0 ){
      day.events = this.sort("fieldEventMainStartTime", day.events);
      return day.events;
    }else{
      return day.events;
    }

  }
  typesDropdownSort(e) {
    if(!e) {
    //wtf, too many different ways one set of data can be presented
      let selected = [];
      if(this.filterFormItems.types) {
        const sortedSelected = this.filterFormItems.types.sort((a:any, b:any) => {
          if(a.name.toUpperCase() > b.name.toUpperCase()) {
            return 1;
          }
          return -1;
        });
        selected = [...sortedSelected];
        this.filterFull = true;
      }
      let otherValues = this.eventsTypes.filter(type => {
          return !selected.find(value => {
            return type.tid === parseInt(value.id)
          });
        }
      ).map(e => {
        return {
          name: e.name,
          id: `${e.tid}`
        }
      }).sort((a:any, b:any) => {
        if(a.name.toUpperCase() > b.name.toUpperCase()) {
          return 1;
        }
        return -1;
      });
      this.filterFormItems.types = [...selected];
      this.eventsTypesSet = [...selected, ...otherValues];
    }
  }
  //every day we fall further from god's light
  tagsDropdownSort(e) {
    if(!e) {
      let selected = [];
      if(this.filterFormItems.tags) {
        const sortedSelected = this.eventsTags.filter(tag => this.filterFormItems.tags.find(selectedTag => tag.entityId === selectedTag)).sort((a:any, b:any) => {
          if(a.entityLabel.toUpperCase() > b.entityLabel.toUpperCase()) {
            return 1;
          }
          return -1;
        });
        selected = [...sortedSelected];
        this.filterFull = true;
      }
      const otherValues = this.eventsTags.filter(e => !selected.find(x => x.entityId === e.entityId)).sort((a:any, b:any) => {
        if(a.entityLabel.toUpperCase() > b.entityLabel.toUpperCase()) {
          return 1;
        }
        return -1;
      })
      this.filterFormItems.tags = selected.map(e => e.entityId);;
      this.eventsTags = [...selected, ...otherValues];
    }
  }
  getData() {
        if(!this.filterFull) {
          this.filterFull = this.filterFullProperties.some(property => this.params[property] !== undefined );
        }    
        this.eventsConfig = new EventsConfig();

        // TITLE
        if(this.params['title']){
          this.eventsConfig.titleEnabled = true;
          this.eventsConfig.titleValue = this.params['title']
        }


        // DATE FROM
        if(this.params['dateFrom'] && moment(this.params['dateFrom'], 'DD-MM-YYYY').isValid()){
          this.eventsConfig.dateFrom = moment(this.params['dateFrom'], 'DD-MM-YYYY').format('YYYY-MM-DD').toString();
        }else{
          this.eventsConfig.dateFrom = moment().format("YYYY-MM-DD").toString();
        }
        // DATE TO
        if(this.params['dateTo'] && moment(this.params['dateTo'], 'DD-MM-YYYY').isValid()){
          this.eventsConfig.dateTo = moment(this.params['dateTo'], 'DD-MM-YYYY').format('YYYY-MM-DD').toString();
        }

        if( this.view == "calendar" ){
          this.eventsConfig.dateFrom = moment("01-"+this.month+"-"+this.year, 'DD-MM-YYYY').startOf("month").format('YYYY-MM-DD').toString();
          this.eventsConfig.dateTo = moment("01-"+this.month+"-"+this.year, 'DD-MM-YYYY').endOf("month").format('YYYY-MM-DD').toString();
          this.eventsConfig.limit = 999;
          this.eventsConfig.offset = 0;
        }
        
        /*
        if( this.view == "list" ){

          // DATE FROM
          if(this.params['dateFrom'] && moment(this.params['dateFrom'], 'DD-MM-YYYY').isValid()){
            this.eventsConfig.dateFrom = moment(this.params['dateFrom'], 'DD-MM-YYYY').format('YYYY-MM-DD').toString();
          }else{
            this.eventsConfig.dateFrom = moment().format("YYYY-MM-DD").toString();
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
        */


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

        if( this.view == "list" ){
          let startTimeHours = parseFloat( _moment().format("HHz") );
          let startTimeMinutes = parseFloat( _moment().format("MMz") );
          let startTimeSeconds:any = (startTimeHours*60*60)+(startTimeMinutes*60);
          startTimeSeconds = startTimeSeconds.toString();
          //this.eventsConfig['timeFrom'] = startTimeSeconds;

          this.eventsConfig['timeFrom'] = "0";
        }else{
          this.eventsConfig['timeFrom'] = "0";
        }

        let variables = this.eventsConfig.getApollo(this.lang.toUpperCase());

        variables['timeEnabled'] = false;

        this.calendarDataEntries = "none";

        this.initialScrollRestorationSetup(variables);

        this.dataSubscription = this.http.get('getEventList', {params: variables}).subscribe((response) => {

          let data = response['data'];
          
          if( this.status ){ return false; }

          this.status = false;

          if( this.view == "list" ){

            this.count = data['nodeQuery']['count'];
            this.eventListRaw = data['nodeQuery']['entities'];
            
            this.eventList = this.organizeList( this.eventListRaw );
            
            // if (data['nodeQuery']['entities'] && (data['nodeQuery']['entities'].length < this.eventsConfig.limit)){
            //   this.listEnd = true;
            // }
            if (this.eventListRaw && this.eventListRaw.length === this.count) {
              this.listEnd = true;
            }
          }else{
            this.dataToCalendar( JSON.stringify( data['nodeQuery']['entities'] ) );
          }
          
          this.dataSubscription.unsubscribe();
          this.dataSubscription = false;
          
        }, (err) => {
          this.eventList = [];
          this.listEnd = true;
          this.dataSubscription.unsubscribe();
          this.dataSubscription = false;
        });
  }

  getTypes() {

    let variables = {
      lang: this.lang.toUpperCase()
    };

    let typesSubscription = this.http.get('getEventTypes', {params:variables}).subscribe((response) => {
      
      let data = response['data'];

      this.eventsTypes = data['taxonomyTermQuery']['entities'];

      let newsTidArr = [];
      for( var i in this.eventsTypes ){
        let current = this.eventsTypes[i];

        if( !current ){ continue; }

        let tmp = {
          id: current['tid'].toString(),
          name: current['name'],
        };
        newsTidArr.push(tmp);           
      };

      if( this.params.types !== undefined ){
        let splitParams = this.params.types.split(",");

        this.filterFormItems['types'] = [];

        for( let i in newsTidArr ){
          
          if( splitParams.indexOf(newsTidArr[i]['id']) !== -1 ){
            this.filterFormItems['types'].push(newsTidArr[i]);
          }
        }
        for( let i in splitParams ){

        }
      }

      newsTidArr = newsTidArr.filter((thing, index, self) =>
      index === self.findIndex((t) => (
        t.id === thing.id && t.name === thing.name
      )))
      this.eventsTypesSet = [...newsTidArr];
      this.typesDropdownSort(false);
    });
    this.subscriptions = [...this.subscriptions, typesSubscription];

  }

  getTags() {
    let variables = {
      lang: this.lang.toUpperCase()
    };
    let tagSubscription = this.http.get('getEventTags', {params:variables}).subscribe((response: any) => {
      const data = response.data.taxonomyTermQuery.tags;
      this.eventsTags = data.filter((e) => e.referencedNodes.count > 0);
      this.eventsTagsObs = of(this.eventsTags).pipe(delay(500)); // create an Observable OF current array delay  http://reactivex.io/documentation/observable.html try to make it different
      this.tagsDropdownSort(false);
    });
    this.subscriptions = [...this.subscriptions, tagSubscription];
  }
  
  ngOnDestroy() {
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
    if (this.scrollRestoration.scrollableRoutes.includes(this.scrollRestoration.currentRoute)) {
      this.scrollRestoration.setRouteKey('limit', this.eventsConfig.limit + this.eventsConfig.offset)
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

  trapFocus(id) {
    document.getElementById(id).focus();
  }

  initialScrollRestorationSetup(hash) {
    let scrollData = this.scrollRestoration.getRoute(decodeURI(window.location.pathname));
    if (scrollData && this.rootScope.get('scrollRestorationState') && this.view === "list") {
      this.eventsConfig.offset = !this.eventList && scrollData.limit ? scrollData.limit - this.eventsConfig.limit : this.eventsConfig.offset;
      hash['offset'] = !this.eventList ? 0 : this.eventsConfig.offset;
      hash['limit'] = (!this.eventList && scrollData.limit) ? scrollData.limit : this.eventsConfig.limit;
    }
  }

  ngAfterViewChecked() {
    if (!this.scrollPositionSet && this.content && this.content.nativeElement.offsetParent != null && this.view === 'list') {
      this.scrollRestoration.setScroll();
      this.scrollPositionSet = true;
      this.scrollRestoration.reset();
    }
  }
}