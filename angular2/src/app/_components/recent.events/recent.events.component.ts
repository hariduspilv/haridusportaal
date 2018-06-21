import { Component, OnDestroy, ViewChild, Input, OnInit } from '@angular/core';
import { EventsService, RootScopeService } from '../../_services';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { AgmCoreModule } from '@agm/core';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {EventsRegistratonDialog} from '../../_components/dialogs/events.registration/events.registration.dialog'

@Component({
	selector: 'recent-events',
	templateUrl: './recent.events.component.html',
	styleUrls: ['../../_views/events.single/events.single.component.scss']
})

export class RecentEventsComponent implements OnInit {
	
	@Input() groupID: number;
	@Input() map: any;
	@Input() content: any;
	
	error: boolean;
  lang: any;
  unix: any;
	allPath: any;

	constructor(private eventService: EventsService, private router: Router, private route: ActivatedRoute, public dialog: MatDialog) {}
	
	ngOnInit() {
    this.lang = this.router.url;
    this.unix = new Date().getTime();
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

