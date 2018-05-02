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
  templateUrl: './events.single.component.html'
})

export class EventsSingleComponent {

  content: any;
  unix: any;
  error: boolean;
  map: any;

  constructor(private router: Router, private route: ActivatedRoute, private eventService: EventsService, private rootScope:RootScopeService, private moment: MomentModule) {

    this.route.params.subscribe( params => {

      this.content = false;

      this.error = false;

      const path = this.router.url;

      const that = this;

      eventService.getSingle(path, function(data) {
        if ( data['route'] == null ) {
          that.error = true;
        } else {


          that.content = data['route'];

          if( that.content.entity.fieldEventLocation ){
            that.map = {
              "lat": parseFloat(that.content.entity.fieldEventLocation.lat),
              "lon": parseFloat(that.content.entity.fieldEventLocation.lon),
              "zoom": parseFloat(that.content.entity.fieldEventLocation.zoom)
            }
          }

          console.log(that.content);
          that.unix = new Date().getTime();

          console.log(that.unix);
        }
      });

    });
  }

}
