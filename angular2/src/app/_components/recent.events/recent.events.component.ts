import { Component, OnDestroy, ViewChild, Input, OnInit } from '@angular/core';
import { EventsService, RootScopeService } from '../../_services';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
	selector: 'recent-events',
	templateUrl: './recent.events.component.html',
})

export class RecentEventsComponent implements OnInit {

	@Input() groupID: number;

	error: boolean;
	content: any;
   lang: any;
   allPath: any;

	constructor(private eventService: EventsService, private router: Router, private route: ActivatedRoute) {
		
     


	}
	ngOnInit() {

		let that = this;

      this.lang = this.router.url;

      this.route.params.subscribe( params => {
         if( this.lang == "/en" ){
            this.allPath = "/en/events";
         }
         else if( this.lang == "/et" ){
            this.allPath = "/et/sundmused";
         }
      });

		this.eventService.getRecent(function(data){
			if ( data['nodeQuery'] == null ) {
				that.error = true;
			} else {
				that.content = data['nodeQuery']['entities'];
				console.log(that.content);
			}
		});

	}

}

