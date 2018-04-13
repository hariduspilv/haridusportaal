import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ArticleService, RootScopeService } from '../../_services';

@Component({
  templateUrl: './news.component.html'
})

export class NewsComponent {

  content: any;
  breadcrumb: any;
  error: boolean;

  constructor(private router: Router, private route: ActivatedRoute, private articleService: ArticleService, private rootScope:RootScopeService) {

    this.route.params.subscribe( params => {

      this.content = false;
      this.error = false;
      this.breadcrumb = false;
      
      const path = this.router.url;

      const that = this;

      articleService.getArticle(path, function(data) {

        const langOptions = data['route']['languageSwitchLinks'];
        let langValues = {};
        for( var i in langOptions ){
          langValues[langOptions[i].language.id] = langOptions[i].url.path;
        }
        rootScope.set('langOptions', langValues);

        if ( data['route'] == null ) {
          that.error = true;
        } else {
          that.content = data['route']['entity'];
          that.breadcrumb = data['route']['breadcrumb'];
        }

      });

    });
  }

}
