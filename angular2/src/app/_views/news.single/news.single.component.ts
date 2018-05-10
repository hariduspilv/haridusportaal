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
  templateUrl: './news.single.component.html'
})

export class NewsSingleComponent {

  content: any;
  unix: any;
  error: boolean;
  map: any;

  constructor(
		private router: Router,
		private route: ActivatedRoute,
		private newsService: NewsService,
		private rootScope:RootScopeService,
		private moment: MomentModule
   ) {

    this.route.params.subscribe( params => {

      this.content = false;

      this.error = false;

      const path = this.router.url;

      const that = this;

      newsService.getSingle(path, function(data) {
        if ( data['route'] == null ) {
          that.error = true;
        } else {
          that.content = data['route']['entity'];
          console.log(that.content);
        }
      });

    });
  }

}
