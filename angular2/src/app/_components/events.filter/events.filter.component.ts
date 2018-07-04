import { Component, OnInit, OnChanges } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material";
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as _moment from 'moment';
import { getEventsTags, getEventsTypes } from '../../_services/events/events.graph';

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

export class EventsFilterComponent implements OnInit {

  filterFormItems: object = {};

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {

  }

  ngOnInit() {

    this.activatedRoute.queryParams.subscribe( (params: Params) => {
      this.filterRetrieveParams( params );
    });

  }

  filterParseDate(dateString: string){
    var tmpDate = new Date( dateString );
    var year = tmpDate.getFullYear();
    var month:any = tmpDate.getMonth()+1;
    var day:any = tmpDate.getDate();

    if( month < 10 ){
      month = "0"+month;
    }

    if( day < 10 ){
      day = "0"+day;
    }

    return day+"-"+month+"-"+year;
  }

  filterRetrieveParams(params:object) {
    for( var i in params ){

      if( i.match("date") ){
        this.filterFormItems[i] = _moment(params[i], "DD-MM-YYYY");
      }else{
        this.filterFormItems[i] = params[i];
      }
    }
  }

  filterSubmit() {

    let urlParams = {};

    for( var i in this.filterFormItems ){
      if( this.filterFormItems[i] == '' ){
        delete this.filterFormItems[i];
      }
      else if( i.match("date") && typeof( this.filterFormItems[i] ) == 'object' && this.filterFormItems[i] !== null){
        console.log(this.filterFormItems[i]);
        urlParams[i] = this.filterParseDate( this.filterFormItems[i] );
      }else{
        urlParams[i] = this.filterFormItems[i];
      }
    }

    this.router.navigate([], {
      queryParams: urlParams,
      replaceUrl: true
    });

  }

}