import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import * as moment from 'moment';

import { EventsService, RootScopeService } from '../../_services';
import { getBreadcrumb } from '../../_services/breadcrumb/breadcrumb.graph';
// import { EventsJson } from '../../_services/events/events.json';
import { sortEventsByOptions } from '../../_services/events/events.graph';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/of';

import { Apollo, QueryRef } from 'apollo-angular';



import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from "@angular/material";

export class AppDateAdapter extends NativeDateAdapter {
  
  format(date: Date, displayFormat: Object): string {
    
    if (displayFormat === 'input') {
      const day = date.getDate()>10 ? date.getDate() : "0"+date.getDate();
      const month = (date.getMonth() + 1)>=10 ? (date.getMonth() + 1) : "0"+(date.getMonth() + 1);
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } else {
      return date.toDateString();
    }
  }
}

export const APP_DATE_FORMATS =
{
  parse: {
    dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
  },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'numeric' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  }
};

@Component({
  templateUrl: './events.component.html',
  providers: [
    {
      provide: DateAdapter, useClass: AppDateAdapter
    },
    {
      provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
  ]
})

export class EventsComponent implements OnInit {
  
  feedRef: QueryRef<any>;
  feedSub: any;
  
  path: string;
  lang: string;
  breadcrumb: any;
  eventList: any;
  
  filterFormGroup = new FormGroup({
    titleForm: new FormControl({ value: null, disabled: false }),
    minDateForm: new FormControl({ value: null, disabled: false }),
    maxDateForm: new FormControl({ value: null, disabled: false }),
    newsTagsSelectForm: new FormControl({ value: [], disabled: false }),
  });
  
  
  
  // Events config
  tagValue: string = "";
  tagEnabled: boolean = false;
  tidValue: string = "";
  tidEnabled: boolean = false;
  titleValue: string = "";
  titleEnabled: boolean = false;
  minDate: string = moment().format('YYYY-MM-DD').toString(); //"1901-00-00" TODAY
  maxDate: string = "2038-00-00"; //"2038-00-00"
  
  datepickerMin = new Date(2000, 1, 1);
  datepickerMax = new Date(2200, 12, 31);
  
  // momentDateTest = "2147483647" + "000";
  // momentDateTest = "-2147483647" + "000";
  // console.log(moment(this.momentDateTest.toString(), 'unix').format('YYYY-MM-DD'));
  // moment().isValid()
  
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
    private rootScope: RootScopeService,
    private formBuilder: FormBuilder
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
  
  // formatDate(d) {
  //   d = d.substr(0,2)+"/"+d.substr(2,2)+"/"+d.substr(4,2)
  //   return d
  // }

  onAddDate(event: any) {
    // if(event.target.value.length == 2) {
    //   event.target.value + "/";
    // }
    // if(event.target.value.length == 5 ) {
    //   event.target.value + "/";
    // }
    // if(event.target.value.length == 10 ) {
    //   event.target.value;
    // }
    // console.log(event.target.value.length)
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
    
    this.setPaths();
    
    // console.log(moment(new Date(this.minDate)).unix())
    
    this.route.queryParams.subscribe(
      (params) => {
        console.log(params)
      }
    )    
    
    this.route.queryParamMap.subscribe(
      (params) => {
        console.log(params)
      }
    )
    
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
          console.log(this.eventList)
          if (this.eventList && (this.eventList.length < this.limit)){
            this.listEnd = true;
          }
        });
        
        
        
      }
    ) // PARAMS END
    
    
    
  }
  
}