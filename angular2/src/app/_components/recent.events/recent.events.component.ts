import { Component, OnDestroy, ViewChild, Input, Output, OnInit, EventEmitter } from '@angular/core';
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

export class RecentEventsComponent implements OnInit, OnDestroy {
	
	@Input() groupID: number;
	@Input() nid: number;
	@Input() map: any;
	@Input() content: any;
	@Output() viewChange = new EventEmitter<boolean>();
	
	error: boolean;
  lang: any;
  unix: any;
	allPath: any;

	paramsSub: any;

	constructor(private eventService: EventsService, private router: Router, private route: ActivatedRoute, public dialog: MatDialog) {}
	
	ngOnInit() {

		this.paramsSub = this.route.params.subscribe( params => {
			this.lang = params['lang'];
		});

		this.unix = new Date().getTime();
	}
	ngOnDestroy() {
		this.paramsSub.unsubscribe();
	}

	toggleParticipants (status) {
		this.viewChange.emit(status)
		location.hash = 'osalejad'
	}
	
	openDialog(): void {
		let dialogRef = this.dialog.open(EventsRegistratonDialog, {
		  // width: '500px',
		  data: {
			eventTitle: this.content.entity.entityLabel,
			eventStartDate: this.content.entity.fieldEventDate[0].entity,
			nid: this.nid,
			lang: this.lang
		  }
		});
		
		dialogRef.afterClosed().subscribe(result => {
		  // this.registrationData = result;
		});
  }
	
}

