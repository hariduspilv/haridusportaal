import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';


import { EventsService, RootScopeService } from '../../_services';
import { getBreadcrumb } from '../../_services/breadcrumb/breadcrumb.graph';
// import { EventsJson } from '../../_services/events/events.json';
import { sortEventsByOptions, getEventsTags, getEventsTids } from '../../_services/events/events.graph';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { delay, map } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/observable/of';

import { Apollo, QueryRef } from 'apollo-angular';

import {MomentDateAdapter} from '@angular/material-moment-adapter';
import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material";
import * as _moment from 'moment';

const moment = _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  templateUrl: './events.component.html',
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})

export class EventsComponent implements OnInit {
  
  feedRef: QueryRef<any>;
  feedSub: any;
  
  // TAGS
  eventTagObs: Observable<any[]>;
  eventTags: any[];
  selectedTags: any[];
  // TIDS
  eventTidObs: Observable<any[]>;
  eventTids: any[];
  selectedTids: any[];

  // ALL PAGE CONFIG
  path: string;
  lang: string;
  breadcrumb: any;
  eventList: any;

  today = moment();

  
  filterFormGroup = new FormGroup({
    titleForm: new FormControl({ value: null, disabled: false }),
    minDateForm: new FormControl({ value: null, disabled: false }),
    maxDateForm: new FormControl({ value: null, disabled: false }),
    eventTagsSelectForm: new FormControl({ value: [], disabled: false }),
    eventTidSelectForm: new FormControl({ value: [], disabled: false }),
  });
  
  
  // Events config
  tagValue: string = "";
  tagEnabled: boolean = false;
  tidValue: string = "";
  tidEnabled: boolean = false;
  titleValue: string = "";
  titleEnabled: boolean = false;
  minDate: string = moment().format('YYYY-MM-DD').toString(); //"1901-00-00" TODAY
  maxDate: string = moment("2038-01-01").format('YYYY-MM-DD').toString(); //"2038-01-01"
  // http://test-htm.wiseman.ee:30000/et/admin/config/regional/date-time/formats/add
  
  datepickerMin: Date;
  datepickerMax: Date;
  
  offset: number = 0;
  limit: number = 3;
  
  showTagsInput: boolean = false;
  toggleFilter: boolean = false;  
  listEnd: boolean = false;
  error: boolean = false;
  // Events config END  
  
  
  // FORM DATE FORMAT NEEDED - new Date(2000, 1, 1);
  // GRAPHQL DATE FORMAT NEEDED - moment().format('YYYY-MM-DD').toString();
  // QUERY PARAMS FORMAT NEEDED - moment(new Date(this.minDate)).unix().toString();
  
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apollo: Apollo,
    private rootScope: RootScopeService
  ) { }
  
  toggleTags() {
    this.showTagsInput = !this.showTagsInput;
  }
  
  setPaths() {
    this.rootScope.set('langOptions', {
      'en': '/en/events',
      'et': '/et/sundmused'
    });
  }
  
  onAddDate(event: any) {
    var numChars = event.target.value.length;
    if(numChars === 2 || numChars === 5){
      event.target.value = event.target.value + '/';
    }
  }
  onDeleteDate(event: any) {
    var targetVal = event.target.value;    
    if(event.target.value.slice(-1) === "/") {
      event.stopPropagation()
      event.preventDefault()
      event.target.value = targetVal.slice(0, targetVal.length-2);
    }
  }
  
  
  loadMore() {
    this.offset = this.eventList.length;
    this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.path = this.router.url;
        this.lang = params['lang'];
        
        this.apollo.watchQuery({
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
      }
    )
  }
  
  ngOnInit() {
    console.log(new Date(this.minDate));

    var currMonthName  = moment().format('MMMM');
    console.log(currMonthName);

    this.today = moment();
    this.setPaths();
    
    // console.log(moment(new Date(this.minDate)).unix())
    
    // this.route.queryParams.subscribe(
    //   (params) => {
    //     console.log(params)
    //   }
    // )    
    
    // this.route.queryParamMap.subscribe(
    //   (params) => {
    //     console.log(params)
    //   }
    // )
    
    this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.path = this.router.url;
        this.lang = params['lang'];
        
        // FORM FILTER SUBSCRIPTION
        this.filterFormGroup.valueChanges.subscribe((data)=>{
          console.log(data)
          this.datepickerMin = data.minDateForm;
          this.datepickerMax = data.maxDateForm;
        });
        
        // GET BREADCRUMB
        this.apollo.watchQuery({
          query: getBreadcrumb,
          variables: {
            path: this.path,
            lang: this.lang.toUpperCase(),
            fetchPolicy: 'no-cache',
            errorPolicy: 'all',
          },
        })
        .valueChanges
        .subscribe(({data}) => {
          this.breadcrumb = data['route']['breadcrumb'];
        });
        
        // GET LIST OBSERVABLE
        this.feedRef = this.apollo.watchQuery<any>({
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
        })
        
        this.feedSub = this.feedRef.valueChanges.subscribe(({data}) => {
          this.eventList = data['nodeQuery']['entities'];
          if (this.eventList && (this.eventList.length < this.limit)){
            this.listEnd = true;
          }
        });
        

        // get tags
        this.feedRef = this.apollo.watchQuery({
          query: getEventsTags,
          variables: {
            lang: this.lang.toUpperCase(),
            fetchPolicy: 'no-cache',
            errorPolicy: 'all',
          },
        })
        

        this.feedSub = this.feedRef.valueChanges
        .subscribe(({data}) => {
          this.eventTags = data['nodeQuery']['entities'];
          let newsTagArr = [];
          this.eventTags.map((tag)=>{

            tag['Tag'].filter((tagItem, index, array) => {
              let tmp = {
                id: tagItem['entity']['entityId'],
                name: tagItem['entity']['entityLabel'],
              };
              newsTagArr.push(tmp);
            });            
          });

          newsTagArr = newsTagArr.filter((thing, index, self) =>
            index === self.findIndex((t) => (
              t.id === thing.id && t.name === thing.name
            ))
          )
          this.eventTagObs = of(newsTagArr).pipe(delay(500));
          // console.log(newsTagArr)
        });

        // get Tid
        this.feedRef = this.apollo.watchQuery({
          query: getEventsTids,
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        })
        

        this.feedSub = this.feedRef.valueChanges
        .subscribe(({data}) => {
          this.eventTids = data['taxonomyTermQuery']['entities'];
          let newsTidArr = [];
          this.eventTids.filter((tagItem, index, array) => {
            let tmp = {
              id: tagItem['tid'].toString(),
              name: tagItem['name'],
            };
            newsTidArr.push(tmp);           
          });

          newsTidArr = newsTidArr.filter((thing, index, self) =>
            index === self.findIndex((t) => (
              t.id === thing.id && t.name === thing.name
            ))
          )
          this.eventTidObs = of(newsTidArr).pipe(delay(500));
          // console.log(newsTidArr)
        });
        
        
      }
    ) // PARAMS END  
  }
  
  eventsFilter() {
    this.tagEnabled = false;
    this.titleEnabled = false;
    this.tidEnabled = false;
    this.eventList = null;
    this.offset = 0;
    
    // TITLE FILTER
    if(this.filterFormGroup.value.titleForm != null) {
      this.titleEnabled = true;
    }
    
    // DATE FILTER
    if(this.filterFormGroup.value.minDateForm != null) { 
      this.minDate = this.filterFormGroup.value.minDateForm;
    } else { this.minDate = moment().format('YYYY-MM-DD').toString(); }
    if(this.filterFormGroup.value.maxDateForm != null) {
      this.maxDate = this.filterFormGroup.value.maxDateForm;
    } else { this.maxDate = moment("2038-01-01").format('YYYY-MM-DD').toString(); }
    
    // TAG FILTER
    if(this.filterFormGroup.value.eventTagsSelectForm != null) {  
      if(this.filterFormGroup.value.eventTagsSelectForm.length > 0) {  
        this.tagValue = this.filterFormGroup.value.eventTagsSelectForm.map((item) => { return item.id; })
        this.tagEnabled = true;
        // console.log(this.tagValue);
      }
    }
    // TAG FILTER
    if(this.filterFormGroup.value.eventTidSelectForm != null) {  
      if(this.filterFormGroup.value.eventTidSelectForm.length > 0) {  
        this.tidValue = this.filterFormGroup.value.eventTidSelectForm.map((item) => { return item.id; })
        this.tidEnabled = true;
        // console.log(this.tagValue);
      }
    }
        
    
    this.apollo.watchQuery<any>({
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
      this.listEnd = false;      
      if (  data['nodeQuery']['entities'] && (data['nodeQuery']['entities'].length < this.limit) ){
        this.listEnd = true;
      }
    });
    
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
