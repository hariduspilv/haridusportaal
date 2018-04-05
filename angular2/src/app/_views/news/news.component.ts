import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ArticleService } from '../../_services';

@Component({
  templateUrl: './news.component.html'
})

export class NewsComponent {

  content: any;
  breadcrumb: any;
  error: boolean;

  constructor(private router: Router, private route: ActivatedRoute, private articleService: ArticleService) {

    this.route.params.subscribe( params => {

      this.content = false;
      this.error = false;
      this.breadcrumb = false;

      const path = this.router.url;

      const that = this;

      articleService.getArticle(path, function(data) {

        if ( data['route'] == null ) {
          that.error = true;
        } else {
          that.content = data['route']['entity']['entityTranslation'];
          that.breadcrumb = data['route']['breadcrumb'];
        }

      });

    });
  }

}
