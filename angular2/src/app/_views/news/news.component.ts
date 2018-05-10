import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NewsService, RootScopeService } from '../../_services';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { componentFactoryName } from '@angular/compiler';
import { AppComponent } from '../../app.component';
import { Subscription } from 'rxjs/Subscription';
import { MomentModule } from 'angular2-moment/moment.module';

@Component({
  templateUrl: './news.component.html'
})

export class NewsComponent {

  content: any;
  unix: any;
  error: boolean;
  offset: number;
  limit: number;
  listEnd: boolean;
  list: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private newsService: NewsService,
    private rootScope:RootScopeService) {

    const that = this;
    this.limit = 5;
    this.offset = 0;
    this.listEnd = false;

    this.setPaths();

    
    this.route.params.subscribe( params => {

      newsService.getList(this.offset, this.limit, function(data){
        that.list = data['nodeQuery']['entities'];

        if( that.list.length < that.limit ){
          that.listEnd = true;
        }
      });

    });

  }

  setPaths() {
    this.rootScope.set('langOptions', {
      'en': '/en/news',
      'et': '/et/uudised'
    });
  }

  loadMore() {
    let that = this;
    that.offset = that.list.length;

    console.log(that.offset);
    that.newsService.getList(that.offset, that.limit, function(data) {
      if ( data['nodeQuery'] == null ) {
        that.error = true;
      } else {

        that.list = that.list.concat( data['nodeQuery']['entities'] );

        if( data['nodeQuery']['entities'].length < that.limit ){
          that.listEnd = true;
        }
      }
    });
  }

}
