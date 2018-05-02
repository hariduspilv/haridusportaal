import { Component, OnDestroy, ViewChild, Input, OnInit } from '@angular/core';
import { EventsService, RootScopeService } from '../../_services';

@Component({
	selector: 'related-events',
	templateUrl: './related.events.component.html',
})

export class RelatedEventsComponent implements OnInit {

	@Input() groupID: number;
	@Input() nid: any;

	error: boolean;
	content: any;

	constructor(private eventService: EventsService) {
		
	}
	ngOnInit() {

		let that = this;

		this.eventService.getRelated(this.groupID, this.nid, function(data){
			if ( data['nodeQuery'] == null ) {
				that.error = true;
			} else {
				that.content = data['nodeQuery']['entities'];
				console.log( that.content );
			}
		});

	}

}

