import { Component, OnInit, Input, OnDestroy} from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material";
import * as _moment from 'moment';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { delay, map } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/observable/of';

import { Apollo, QueryRef } from 'apollo-angular';
import { Router, ActivatedRoute } from '@angular/router';

import { getEventsTags, getEventsTypes } from '../../_services/events/events.graph';

const moment = _moment;

export const DATEPICKER_FORMAT = {
  parse: {
    dateInput: 'DD-MM-YYYY',
  },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'events-filter',
  templateUrl: 'events.filter.component.html',
  styleUrls: ['events.filter.scss'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    
    {provide: MAT_DATE_FORMATS, useValue: DATEPICKER_FORMAT},
  ]
})

export class EventsFilterComponent implements OnInit, OnDestroy {
  
  subscriptions: Subscription[] = [];
  lang: any;
  path: any;
  urlParams: any;
  
  // Tags
  eventsTags: any[];
  eventsTagsObs: Observable<any[]>;
  
  // Types
  eventsTypes: any[];
  eventsTypesObs: Observable<any[]>;
  
  // Datepicker validation
  datepickerMin: any;
  datepickerMax: any;
  
  // Show/Hide filter
  filterMob: boolean = true;
  filterFull: boolean = false;
  
  // Form controls
  filterForm = new FormGroup({
    title: new FormControl({ value: null, disabled: false }),
    dateFrom: new FormControl({ value: null, disabled: false }),
    dateTo: new FormControl({ value: null, disabled: false }),
    tags: new FormControl({ value: null, disabled: false }),
    types: new FormControl({ value: null, disabled: false }),
  });
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apollo: Apollo,
  ) {
    if(this.route.snapshot.queryParams.dateTo) {
      this.datepickerMax = moment(this.route.snapshot.queryParams.dateTo, 'DD-MM-YYYY');
    }
    if(this.route.snapshot.queryParams.dateFrom) {    
      this.datepickerMin = moment(this.route.snapshot.queryParams.dateFrom, 'DD-MM-YYYY');
    }
  }
  
  ngOnInit() {
    
    this.filterFull = !(document.documentElement.clientWidth > 900)
    this.filterMob = document.documentElement.clientWidth > 900

    let querySubscription = this.route.queryParams.subscribe(
      (params) => {
        this.filterForm.controls.title.setValue(params.title);
        if(params.dateFrom){
          this.filterForm.controls.dateFrom.setValue(moment(params.dateFrom, 'DD-MM-YYYY'));
        }
        if(params.dateTo){
          this.filterForm.controls.dateTo.setValue(moment(params.dateTo, 'DD-MM-YYYY'));                        
        }
        // if(params.tags){
        //   this.filterForm.controls['tags'].setValue([{id:"1342", name:"poeg"}])
        // }
        // if(params.types){
        //   this.eventsTypessSel = params.types
        // }
        // Need to assign an object
      }
    )
    
    this.filterForm.valueChanges.subscribe((data)=>{
      if(data.dateFrom) {
        this.datepickerMin = moment(data.dateFrom);
      }
      if(data.dateTo) {
        this.datepickerMax = moment(data.dateTo);
      }
    });
    
    let routeSubscription = this.route.params.subscribe((params: ActivatedRoute) => {
      this.path = this.router.url;      
      this.lang = params['lang'];
    })
    this.subscriptions = [...this.subscriptions, routeSubscription];
    
    // TAG SUBSCRIPTION
    let tagSubscription = this.apollo.watchQuery({
      query: getEventsTags,
      variables: {
        lang: this.lang.toUpperCase(),
      },
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    }).valueChanges
    .subscribe(({data}) => {
      this.eventsTags = data['nodeQuery']['entities'];
      let newsTagArr = [];
      this.eventsTags.map((tag)=>{
        tag['Tag'].filter((tagItem, index, array) => {
          if( tagItem['entity'] ){
            let tmp = {
              id: tagItem['entity']['entityId'],
              name: tagItem['entity']['entityLabel'],
            };
            newsTagArr.push(tmp);
          }
        });
      });
      newsTagArr = newsTagArr.filter((thing, index, self) =>
      index === self.findIndex((t) => (
        t.id === thing.id && t.name === thing.name
      )))
      this.eventsTagsObs = of(newsTagArr).pipe(delay(500)); // create an Observable OF current array delay  http://reactivex.io/documentation/observable.html try to make it different
    });
    this.subscriptions = [...this.subscriptions, tagSubscription];
    
    //TYPES SUBSCRIPTION
    let typesSubscription = this.apollo.watchQuery({
      query: getEventsTypes,
      variables: {
        lang: this.lang.toUpperCase(),        
      },
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    }).valueChanges
    .subscribe(({data}) => {
      this.eventsTypes = data['taxonomyTermQuery']['entities'];
      let newsTidArr = [];
      this.eventsTypes.filter((tagItem, index, array) => {
        let tmp = {
          id: tagItem['tid'].toString(),
          name: tagItem['name'],
        };
        newsTidArr.push(tmp);           
      });
      newsTidArr = newsTidArr.filter((thing, index, self) =>
      index === self.findIndex((t) => (
        t.id === thing.id && t.name === thing.name
      )))
      this.eventsTypesObs = of(newsTidArr).pipe(delay(500));
    });
    this.subscriptions = [...this.subscriptions, typesSubscription];
  }
  
  eventsFilter() {
    let queryParamsArr = {};
    for( var i in this.filterForm.controls ){
      if( this.filterForm.controls[i].value !== "" ){
        queryParamsArr[i] = this.filterForm.controls[i].value;
      }
      if( this.filterForm.controls[i].value instanceof Array ) {
        queryParamsArr[i] = this.filterForm.controls[i].value.map((data)=>{
          return data.id
        }).join(',') // TAG1,TAG2,TAG3
      }
      if( i.toLowerCase().match("date") ){
        if(moment(this.filterForm.controls[i].value).isValid()){
          queryParamsArr[i] = moment(this.filterForm.controls[i].value).format('DD-MM-YYYY').toString()
        }
        if(!moment(this.filterForm.controls[i].value).isValid()){
          queryParamsArr[i] = null
        }
      }
    }
    
    this.router.navigate([], {
      queryParams: queryParamsArr,
      // relativeTo: this.route
    });
  }
  
  onClearTags() {
    this.filterForm.controls['tags'].setValue(null);
  }

  onClearTypes() {
    this.filterForm.controls['types'].setValue(null);
  }

  toggleFilterFull() {
    this.filterFull = !this.filterFull
  }
  
  toggleFilterMob() {
    this.filterFull = document.documentElement.clientWidth < 900
    this.filterMob = !this.filterMob
  }
  
  ngOnDestroy() {
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
  
}