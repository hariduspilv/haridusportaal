import { Component, OnDestroy, ViewChild, Input, OnInit } from '@angular/core';
import { RootScopeService } from '../../_services/rootScope/rootScope.service';
import { relatedQuery } from '../../_services/events/events.graph';

import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription'; 


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
		private apollo: Apollo
	) {}

	ngOnInit() {

		let that = this;

		this.lang = this.rootScope.get('currentLang');

		let subscription = this.apollo.watchQuery({
			query: relatedQuery,
			variables: {
				groupID: this.groupID.toString(),
				nid: this.nid.toString(),
				lang: this.lang.toUpperCase(),
			},
			fetchPolicy: 'no-cache',
			errorPolicy: 'all',
		})
		.valueChanges
		.subscribe(({data}) => {

			if ( data['nodeQuery'] == null ) {
				that.error = true;
			} else {
				that.content = data['nodeQuery']['entities'];
			}

			subscription.unsubscribe();
		});

	}

}

