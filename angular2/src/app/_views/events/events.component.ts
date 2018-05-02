import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { EventsService, RootScopeService } from '../../_services';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { componentFactoryName } from '@angular/compiler';
import { AppComponent } from '../../app.component';
import { Subscription } from 'rxjs/Subscription';
import { MomentModule } from 'angular2-moment/moment.module';

@Component({
  templateUrl: './events.component.html'
})

export class EventsComponent {

  content: any;
  unix: any;
  error: boolean;
  offset: number;
  limit: number;
  listEnd: boolean;

  constructor(private router: Router, private route: ActivatedRoute, private eventService: EventsService, private rootScope:RootScopeService, private moment: MomentModule) {

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

}
