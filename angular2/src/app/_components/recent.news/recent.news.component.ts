import { Component, OnDestroy, ViewChild, Input, OnInit, ElementRef} from '@angular/core';
import { NewsService, RootScopeService } from '@app/_services';
import { Router, ActivatedRoute } from '@angular/router';

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
	@Input('nid') nid: string = "";
	@Input() frontpage: boolean = false; 

	constructor(private newsService: NewsService, private router: Router, private route: ActivatedRoute) {
		
	}
	ngOnInit() {

		this.lang = this.router.url;
		let that = this;
		
		this.route.params.subscribe( params => {

			this.content = false;

			if( this.lang == "/en" ){
				this.allPath = "/en/news";
			}
			else if( this.lang == "/et" ){
				this.allPath = "/et/uudised";
			}

			this.newsService.getRecent(this.nid, function(data){
				if ( data['nodeQuery'] == null ) {
					that.error = true;
				} else {
					that.content = data['nodeQuery']['entities'];
				}
			});
		});
		
		
	}
}

