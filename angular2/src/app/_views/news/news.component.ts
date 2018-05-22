import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { componentFactoryName } from '@angular/compiler';
import { MomentModule } from 'angular2-moment/moment.module';
import { Apollo, QueryRef } from 'apollo-angular';
import * as moment from 'moment';

import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';


import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { RootScopeService } from '../../_services';
import { AppComponent } from '../../app.component';
import { getBreadcrumb } from '../../_services/breadcrumb/breadcrumb.graph';
import { sortByOptions, getNewsTags } from '../../_services/news/news.graph';

@Component({
  templateUrl: './news.component.html'
})

export class NewsComponent implements OnInit, OnDestroy{
  
  // TAGS
  
  newsTags: any[];
  selected: any[];
  // for datepicker
  
  public newsTagsSelectForm = new FormControl();
  public titleForm = new FormControl();
  public minDateForm = new FormControl();
  public maxDateForm = new FormControl();
  
  
  public querySubscription: Subscription;  
  public breadcrumb: any;
  public error: boolean;
  
  public listEnd: boolean = false;
  public path: string;
  public lang: string;
  
  public list: any;
  public offset: number = 0; 
  public limit: number = 10;
  
  public tagValue: Array<string> = [];
  public titleValue: string = "";
  public tagEnabled: boolean = false;
  public titleEnabled: boolean = false;
  public minDate: String = "-2147483647";
  public maxDate: String = "2147483647";
  
  constructor ( 
    private router: Router,
    private route: ActivatedRoute,
    private rootScope: RootScopeService,
    private apollo: Apollo
  ) { }
  
  
  private subBreadcrumbs: Subscription;
  
  paramName: string;
  paramLastName: string
  
  
  
  setPaths() {
    this.rootScope.set('langOptions', {
      'en': '/en/news',
      'et': '/et/uudised'
    });
  }
  
  
  
  loadMore() {
    this.offset = this.list.length;
    this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.path = this.router.url;
        this.lang = params['lang'];
        
        this.apollo.watchQuery({
          query: sortByOptions,
          variables: {
            tagValue: this.tagValue,
            tagEnabled: false,
            titleValue: "%" + this.titleValue + "%",
            titleEnabled: false,
            minDate: "-2147483647",
            maxDate: "2147483647",
            lang: this.lang.toUpperCase(),
            offset: this.offset,
            limit: this.limit            
          },
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        }).valueChanges.subscribe(({data, loading}) => {
          this.list = this.list.concat(data['nodeQuery']['entities']);
          if ( data['nodeQuery']['entities'] && (data['nodeQuery']['entities'].length < this.limit) ){
            this.listEnd = true;
          }
        });        
      }
    )
  }
  
  ngOnInit() {
    
    
    
    this.setPaths();
    
    // query parameters observable
    this.route.queryParams.subscribe(params => {
      this.titleValue = params.title;
      if(this.titleValue != null) {
        this.titleEnabled = true;
      }
      // console.log(this.titleValue)
    });
    
    this.route.params.subscribe(
      (params: ActivatedRoute) => {
        
        this.path = this.router.url;
        this.lang = params['lang'];     
        
        // get news list
        this.querySubscription = this.apollo.watchQuery({
          query: sortByOptions,
          variables: {
            tagValue: this.tagValue,
            tagEnabled: false,
            titleValue: "%" + this.titleValue + "%",
            titleEnabled: false,
            minDate: "-2147483647",
            maxDate: "2147483647",
            lang: this.lang.toUpperCase(),
            offset: this.offset,
            limit: this.limit            
          },
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        }).valueChanges.subscribe(({data, loading}) => {
          this.list = data['nodeQuery']['entities'];
          if (this.list && (this.list.length < this.limit)){
            this.listEnd = true;
          }
        });
        
        // get breadcrumbs
        this.querySubscription = this.apollo.watchQuery({
          query: getBreadcrumb,
          variables: {
            path: this.path,
            lang: this.lang.toUpperCase(),
            fetchPolicy: 'no-cache',
            errorPolicy: 'all',
          },
        })
        .valueChanges
        .subscribe(({data}) => {
          this.breadcrumb = data['route']['breadcrumb'];
        });
        
        // get tags
        this.querySubscription = this.apollo.watchQuery({
          query: getNewsTags,
          variables: {
            lang: this.lang.toUpperCase(),
            fetchPolicy: 'no-cache',
            errorPolicy: 'all',
          },
        })
        .valueChanges
        .subscribe(({data}) => {
          this.newsTags = data['taxonomyTermQuery']['entities'];
        });
        
      }
    )
  }
  
  newsFilter() {
    // TITLE FILTER
    if(this.titleForm.value != null) {
      this.titleEnabled = true;
    }

    // DATE FILTER
    if(this.minDateForm.value != null) { 
      // this.minDate = (this.minDateForm.value.getTime()/1000).toString();
      this.minDate = (this.minDateForm.value.getTime()/1000).toString();
    } else { this.minDate = "-2147483647"; }
    if(this.maxDateForm.value != null) {
      this.maxDate = (this.maxDateForm.value.getTime()/1000 + 86399).toString();
    } else { this.maxDate = "2147483647"; }
    console.log(this.minDate)
    console.log(this.maxDate)
    

    this.offset = 0;
    this.apollo.watchQuery({
      query: sortByOptions,
      variables: {
        tagValue: this.tagValue,
        tagEnabled: false,
        titleValue: "%" + this.titleForm.value + "%",
        titleEnabled: this.titleEnabled,
        minDate: this.minDate,
        maxDate: this.maxDate,
        lang: this.lang.toUpperCase(),
        offset: this.offset,
        limit: this.limit            
      },
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    }).valueChanges.subscribe(({data, loading}) => {
      this.list = data['nodeQuery']['entities'];
      this.listEnd = false;      
      if (  data['nodeQuery']['entities'] && (data['nodeQuery']['entities'].length < this.limit) ){
        this.listEnd = true;
      }
    });
  }
  
  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }
}