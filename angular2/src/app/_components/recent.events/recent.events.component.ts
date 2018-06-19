import { Component, OnDestroy, ViewChild, Input, OnInit } from '@angular/core';
import { EventsService, RootScopeService } from '../../_services';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AgmCoreModule } from '@agm/core';

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
	allPath: any;

	constructor(private eventService: EventsService, private router: Router, private route: ActivatedRoute) {}
	
	ngOnInit() {
		this.lang = this.router.url;
	}
	
}

