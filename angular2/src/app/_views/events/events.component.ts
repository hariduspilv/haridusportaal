import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { EventsService, RootScopeService } from '../../_services';
import { getBreadcrumb } from '../../_services/breadcrumb/breadcrumb.graph';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { componentFactoryName } from '@angular/compiler';
import { AppComponent } from '../../app.component';
import { Subscription } from 'rxjs/Subscription';
import { Apollo } from 'apollo-angular';
import * as moment from 'moment';

@Component({
  templateUrl: './events.component.html'
})

export class EventsComponent implements OnInit {
  
  private querySubscription: Subscription;  
  private path: string;
  private lang: string;
  
  breadcrumb: any;
  
  content: any;
  unix: any;
  error: boolean;
  offset: number;
  limit: number;
  listEnd: boolean;
  view: string;
  
  calendarDays: any;

  constructor(private router: Router, private route: ActivatedRoute, private eventService: EventsService, private rootScope:RootScopeService, private apollo: Apollo) {
    
    this.changeView("list");

    this.limit = 10;
    this.offset = 0;
    this.listEnd = false;
    
    this.rootScope.set('langOptions', {
      'en': '/en/events',
      'et': '/et/sundmused'
    });
    
    this.route.params.subscribe( params => {
      
      this.rootScope.set('langOptions', {
        'en': '/en/events',
        'et': '/et/sundmused'
      });
      
      this.content = false;
      
      this.error = false;
      
      const path = this.router.url;
      
      const that = this;
      
      eventService.getList(path, function(data) {
        if ( data['nodeQuery'] == null ) {
          that.error = true;
        } else {
          that.content = that.handleData( data );
          
          if( that.content.length < that.limit ){
            that.listEnd = true;
          }
          
          that.unix = new Date().getTime();
        }
      });
      
    });
  }
  
  handleData(inputData) {
    let newData = {};
    
    for( let i in inputData['nodeQuery']['entities'] ){
      let current = inputData['nodeQuery']['entities'][i]['entityTranslation'];
      
      let eventDate = current['eventDates'];
      for( let ii in eventDate ){
        
        let queue = parseInt( ii );
        
        if( queue > 0 ){ continue; }
        
        let currentEventDate = eventDate[ii]['entity'];
        let unixTimestamp = currentEventDate['fieldEventDate'].unix;
        let dateObj = new Date(unixTimestamp * 1000);
        
        let day:any = dateObj.getDate();
        let month:any = dateObj.getMonth();
        
        if( day < 10 ){ day = "0"+day;}
        if( month < 10 ){ month = "0"+month;}
        
        let key:any = dateObj.getFullYear()+""+month+""+day;
        
        key = parseInt(key);
        
        let tmpObj = Object.assign({}, current);
        
        tmpObj.dateObj = currentEventDate;
        
        if( !newData[key] ){
          newData[key] = {
            "key": dateObj.getTime(),
            "timestamp": (dateObj.getTime()/1000)+"",
            "day": dateObj.getDay(),
            "list": []
          };
        }
        
        newData[key].list.push(tmpObj);
      }
      
    }
    
    let outputData = [];
    for( let i in newData ){
      outputData.push(newData[i]);
    }
    return outputData;
  }
  
  loadMore() {
    let that = this;
    const path = this.router.url;
    that.offset = that.content.length;
    
    that.eventService.getList(path, function(data) {
      if ( data['nodeQuery'] == null ) {
        that.error = true;
      } else {
        
        let tmpContent = that.handleData( data );
        that.content = that.content.concat( tmpContent );
        
        if( tmpContent.length < that.limit ){
          that.listEnd = true;
        }
      }
    }, that.offset);
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
      this.eventService.getCalendar(2018, 7);
      this.generateCalendar();
    }
  }
  
  ngOnInit() {

    this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.path = this.router.url;
        this.lang = params['lang'];
        
        this.querySubscription = this.apollo.watchQuery({
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
      }
    )
  }
}
