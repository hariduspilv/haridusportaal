import { Component, OnDestroy, ViewChild, Input, OnInit } from '@angular/core';
import { NewsService, RootScopeService } from '../../_services';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
	selector: 'recent-news',
	templateUrl: './recent.news.component.html',
})

export class RecentNewsComponent implements OnInit {

	@Input() nid: number;

	error: boolean;
   content: any;
   lang: string;

	constructor(private newsService: NewsService, private router: Router, private route: ActivatedRoute) {
		
	}
	ngOnInit() {

      this.lang = this.router.url;
      
		let that = this;

      this.newsService.getRecent(this.nid, function(data){
			if ( data['nodeQuery'] == null ) {
				that.error = true;
			} else {
				that.content = data['nodeQuery']['entities'];
			}
      });
      

	}
}

