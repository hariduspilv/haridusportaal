import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { EventsService, RootScopeService, MetaTagsService } from '../../_services';


import { HttpClient, HttpClientModule } from '@angular/common/http';
import { componentFactoryName } from '@angular/compiler';
import { AppComponent } from '../../app.component';
import { Subscription } from 'rxjs/Subscription';
import { Apollo } from 'apollo-angular';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import {EventsRegistratonDialog} from '../../_components/dialogs/events.registration/events.registration.dialog'



@Component({
  templateUrl: './events.single.component.html'
})

export class EventsSingleComponent {
  
  private querySubscription: Subscription;  
  private path: string;
  private lang: string;
  
  content: any;
  unix: any;
  error: boolean;
  map: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private eventService: EventsService,
    private rootScope:RootScopeService,
    private apollo: Apollo,
    public dialog: MatDialog,
    private metaTags: MetaTagsService
  ) {
    
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

          that.metaTags.set(that.content.entity.entityMetatags);

          if( that.content.entity.fieldEventLocation ){
            that.map = {
              "lat": parseFloat(that.content.entity.fieldEventLocation.lat),
              "lon": parseFloat(that.content.entity.fieldEventLocation.lon),
              "zoom": parseFloat(that.content.entity.fieldEventLocation.zoom)
            }
          }
          that.unix = new Date().getTime();
        }
      });
      
    });
  }
  
  
  ngOnInit() {
  }
  
  
  openDialog(): void {
    let dialogRef = this.dialog.open(EventsRegistratonDialog, {
      // width: '500px',
      data: {
        eventTitle: this.content.entity.entityLabel,
        eventStartDate: this.content.entity.fieldEventDate[0].entity
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      // this.registrationData = result;
    });
  }
}
