import { Component, OnDestroy, ViewChild, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { RootScopeService } from '@app/_services';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription'; 

import { AgmCoreModule } from '@agm/core';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {EventsRegistratonDialog} from '@app/_components/dialogs/events.registration/events.registration.dialog'

import { SettingsService } from '@app/_services/settings.service';

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
		private settings: SettingsService,
		private rootScope: RootScopeService
	) {

		}
	
	ngOnInit() {

		this.unix = this.parseDate( new Date().getTime() / 1000 );

		this.lang = this.rootScope.get("lang");
		
		let tmpDates = {};
		if (this.content.entity.fieldEventDate && this.content.entity.fieldEventDate.length > 0) {
			for( var i in this.content.entity.fieldEventDate ){
				let unix = parseInt( this.content.entity.fieldEventDate[i].entity.fieldEventDate.unix );
				tmpDates[unix] = this.content.entity.fieldEventDate[i];
			}
			let outputDates = [];
			for( var i in tmpDates ){
				outputDates.push( tmpDates[i] );
			}
			this.content.entity.fieldEventDate = outputDates;
		}

		this.iCalUrl = this.settings.url+"/calendarexport/";
		
	}
	ngOnDestroy() {
		if( this.paramsSub ){
			this.paramsSub.unsubscribe();
		}
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
	
	parseDate(input){
		var tmpDate = new Date(input*1000);
		var year = tmpDate.getFullYear();
		var month = tmpDate.getMonth();
		var day = tmpDate.getDate();

		return new Date(year,month,day, 0, 0).getTime();
	}
	canRegister() {

		let firstDate;
		let lastDate;

		console.log(this.content.entity);
		
		if( this.content.entity.fieldRegistrationDate ){
			firstDate = this.parseDate( this.content.entity.fieldRegistrationDate.entity.fieldRegistrationFirstDate.unix );
			lastDate = this.parseDate( this.content.entity.fieldRegistrationDate.entity.fieldRegistrationLastDate.unix );
		}else{
			firstDate = this.parseDate( this.content.entity.fieldEventMainDate.unix );
			lastDate = this.parseDate( this.content.entity.fieldEventMainDate.unix );
		}

		console.log('firstDate: ', firstDate);
		console.log('lastDate: ', lastDate);
		console.log('unix: ', this.unix);

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

//1541721600000