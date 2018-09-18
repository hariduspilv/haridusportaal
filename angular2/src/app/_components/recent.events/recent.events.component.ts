import { Component, OnDestroy, ViewChild, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { RootScopeService } from '@app/_services';
import { Router, ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription'; 

import { AgmCoreModule } from '@agm/core';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {EventsRegistratonDialog} from '@app/_components/dialogs/events.registration/events.registration.dialog'

import { SettingsService } from '@app/_core/settings';

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
	
	iCalUrl: string;
	parseFloat = parseFloat;
	error: boolean;
  lang: any;
  unix: any;
	allPath: any;

	paramsSub: any;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		public dialog: MatDialog,
		private settings: SettingsService
	) {

		}
	
	ngOnInit() {

		console.log(this.content);
		this.iCalUrl = this.settings.url+"/calendarexport/";
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
			eventStartDate: this.content.entity.fieldEventMainDate,
			eventStartTime: this.content.entity.fieldEventMainStartTime,
			eventEndTime: this.content.entity.fieldEventMainEndTime,
			eventExtraDates: this.content.entity.fieldEventDate,
			nid: this.nid,
			lang: this.lang
		  }
		});
		
		dialogRef.afterClosed().subscribe(result => {
		  // this.registrationData = result;
		});
	}
	
	canRegister() {

		let firstDate;
		let lastDate;

		if( this.content.entity.fieldRegistrationDate ){
			firstDate = this.content.entity.fieldRegistrationDate.entity.fieldRegistrationFirstDate.unix * 1000;
			lastDate = this.content.entity.fieldRegistrationDate.entity.fieldRegistrationLastDate.unix * 1000;
		}else{
			firstDate = this.content.entity.fieldEventMainDate.unix * 1000;
			lastDate = this.content.entity.fieldEventMainDate.unix * 1000;
		}

		let isFull = this.content.entity.RegistrationCount >= this.content.entity.fieldMaxNumberOfParticipants;
		if( this.content.entity.fieldMaxNumberOfParticipants == null ){ isFull = false;}

		if( isFull ){
			return 'full';
		}
		
		if( lastDate >= this.unix && firstDate <= this.unix ){	
			return true;
		}
		else if( firstDate > this.unix ){
			return 'not_started';
		}
		else if( lastDate < this.unix ){
			return 'ended';
		}
	}
	
}

