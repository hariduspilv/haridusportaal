import { Component } from '@angular/core';
import { RootScopeService, MetaTagsService, NewsService} from '../../_services';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  templateUrl: './frontpage.component.html',
  styleUrls: ['./frontpage.component.scss']
})

export class FrontpageComponent {

  error: boolean;
	content: any;
	lang: string;
  allPath: any;
  
  constructor (
    private rootScope:RootScopeService,
    private newsService: NewsService,
    private metaTags: MetaTagsService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute
  ) {

    this.route.params.subscribe( params => {
        
      const defaultLang = translate.getDefaultLang();

      const translations = translate.translations;

      translate.get('frontpage').subscribe((res: string) => {
        metaTags.set([
          {
            "name": "title",
            "content": res
          }
        ]);
      });

    });

    this.rootScope.set('langOptions', {
      'en': '/en',
      'et': '/et',
    });
  }
  ngOnInit() {

		this.lang = this.router.url;
		let that = this;
		
		this.route.params.subscribe( params => {
			if( this.lang == "/en" ){
				this.allPath = "/en/news";
			}
			else if( this.lang == "/et" ){
				this.allPath = "/et/uudised";
			}
		});
		
		this.newsService.getRecent(null, function(data){
			if ( data['nodeQuery'] == null ) {
				that.error = true;
			} else {
				that.content = data['nodeQuery']['entities'];
			}
		});
		
	}
}
