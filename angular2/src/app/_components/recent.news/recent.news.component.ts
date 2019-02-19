import { Component, OnDestroy, ViewChild, Input, OnInit, ElementRef} from '@angular/core';
import { RootScopeService } from '@app/_services';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '@app/_services/httpService';

@Component({
	selector: 'recent-news',
	templateUrl: './recent.news.component.html',
	styleUrls: ['../../_views/news.single/news.single.component.scss']
})

export class RecentNewsComponent implements OnInit {
	
	error: boolean;
	content: any;
	lang: string;
	allPath: any;
	@Input('nid') nid: any = 0;
	@Input('data') data: any = false ;
	@Input() frontpage: boolean = false; 

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private http: HttpService,
		private rootScope: RootScopeService
	) {
		
	}

	ngOnInit() {

		this.lang = this.rootScope.get("lang");
		
		this.route.params.subscribe( params => {

			this.content = false;

			this.allPath = "/uudised";
			
      let variables = {
				nid: this.nid,
				lang: this.lang.toUpperCase()
			};
			
			if( this.data ){
				this.content = this.data;
			}else{
				
				let subscribe = this.http.get('recentNews', { params: variables } ).subscribe( (response) => {
					let data = response['data'];
				
					if ( data['nodeQuery'] == null ) {
						this.error = true;
					} else {
						this.content = data['nodeQuery']['entities'];
					}
					subscribe.unsubscribe();
				});

			}
			
		});
		
		
	}
}

