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
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';


import {EventsRegistratonDialog} from '../../_components/dialogs/events.registration/events.registration.dialog'

@Component({
  templateUrl: './events.single.component.html'
})

export class EventsSingleComponent {

  private querySubscription: Subscription;  
  private path: string;
  private lang: string;

  breadcrumb: any;

  content: any;
  unix: any;
  error: boolean;
  map: any;

  constructor(private router: Router, private route: ActivatedRoute, private eventService: EventsService, private rootScope:RootScopeService, private apollo: Apollo, public dialog: MatDialog) {

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

          that.unix = new Date().getTime();
        }
      });

    });
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
          },
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        })
        .valueChanges
        .subscribe(({data}) => {
          this.breadcrumb = data['route']['breadcrumb'];
        });
      }
    )
  }


  animal: string;
  name: string;

  openDialog(): void {
    let dialogRef = this.dialog.open(EventsRegistratonDialog, {
      width: '250px',
      data: { name: this.name, animal: this.animal }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.animal = result;
    });
  }
}
