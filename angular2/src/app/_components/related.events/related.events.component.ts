import { Component, OnDestroy, ViewChild, Input, OnInit } from '@angular/core';
import { RootScopeService } from '@app/_services/rootScopeService';
import { Subscription } from 'rxjs/Subscription'; 
import { HttpService } from '@app/_services/httpService';

@Component({
	selector: 'related-events',
	templateUrl: './related.events.component.html',
	styleUrls: ['./related.events.component.scss']
})

export class RelatedEventsComponent implements OnInit {

	@Input() groupID: number;
	@Input() nid: any;

	error: boolean;
	content: any;

	lang: any;

	constructor(
		private rootScope: RootScopeService,
		private http: HttpService
	) {}

	ngOnInit() {

		let that = this;

		this.lang = this.rootScope.get('lang');

		let url = "/graphql?queryName=getRelatedEvents&queryId=589e6ae883a7cb54f4bf5e9c7f9046decfa54196:1&variables=";
		let variables = {
			groupID: this.groupID.toString(),
			nid: this.nid.toString(),
			lang: this.lang.toUpperCase()
		};

		let subscription = this.http.get(url+JSON.stringify(variables)).subscribe((response) => {
			
			let data = response['data'];

			if ( data['nodeQuery'] == null ) {
				that.error = true;
			} else {
				that.content = data['nodeQuery']['entities'];
			}

			subscription.unsubscribe();
		});

	}

}

