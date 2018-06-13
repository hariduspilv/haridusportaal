import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { componentFactoryName } from '@angular/compiler';
import { Apollo, QueryRef } from 'apollo-angular';

import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';


import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { delay, map } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

import { RootScopeService } from '../../_services';
import { AppComponent } from '../../app.component';
import { sortByOptions, getNewsTags, getNewsTags2 } from '../../_services/news/news.graph';

@Component({
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})

export class NewsComponent implements OnInit, OnDestroy{
  
  // TAGS
  newsTagObs: Observable<any[]>;
  newsTags: any[];
  newsTags2: any[];
  selectedTags: any[];
  
  // for datepicker
  filterFormGroup = new FormGroup({
    titleForm: new FormControl({ value: null, disabled: false }),
    minDateForm: new FormControl({ value: null, disabled: false }),
    maxDateForm: new FormControl({ value: null, disabled: false }),
    newsTagsSelectForm: new FormControl({ value: [], disabled: false }),
  });
  
  
  public querySubscription: Subscription;  
  public error: boolean;
  
  public listEnd: boolean = false;
  public path: string;
  public lang: string;
  
  public list: any;
  public offset: number = 0; 
  public limit: number = 10;
  public filter: boolean = true;
  public filterState: boolean = false;
  
  public titleValue: string = "";
  public titleEnabled: boolean = false;
  public tagValue: Array<string> = [];
  public tagEnabled: boolean = false;
  public minDate: String = "-2147483647";
  public maxDate: String = "2147483647";
  
  constructor ( 
    private router: Router,
    private route: ActivatedRoute,
    private rootScope: RootScopeService,
    private apollo: Apollo
  ) { }
  
  
  
  paramName: string;
  paramLastName: string
  
  
  
  setPaths() {
    this.rootScope.set('langOptions', {
      'en': '/en/news',
      'et': '/et/uudised'
    });
  }
  
  
  hideFilter() {
    this.filter = !this.filter
  }

  changeFilterState() {
    this.filterState = !this.filterState
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
    
    this.filter = document.documentElement.clientWidth > 900
    
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
        
        // // get tags
        // this.querySubscription = this.apollo.watchQuery({
        //   query: getNewsTags,
        //   variables: {
        //     lang: this.lang.toUpperCase(),
        //     fetchPolicy: 'no-cache',
        //     errorPolicy: 'all',
        //   },
        // })
        // .valueChanges
        // .subscribe(({data}) => {
        //   this.newsTags = data['taxonomyTermQuery']['entities'];
        
        //   let newsTagArr = [];
        
        //   for( let i in this.newsTags ){
        //     let current = this.newsTags[i];
        //     let tmp = {
        //       name: current['entityLabel'],
        //       id: current['entityId']
        //     };
        //     newsTagArr.push(tmp);
        //   }
        //   this.newsTagObs = of(newsTagArr).pipe(delay(500));
        //   // console.log(this.newsTagObs)
        //   // console.log(newsTagArr)
        // });
        
        // get tags
        this.querySubscription = this.apollo.watchQuery({
          query: getNewsTags2,
          variables: {
            lang: this.lang.toUpperCase(),
            fetchPolicy: 'no-cache',
            errorPolicy: 'all',
          },
        })
        .valueChanges
        .subscribe(({data}) => {
          this.newsTags2 = data['nodeQuery']['entities'];
          let newsTagArr = [];
          this.newsTags2.map((tag)=>{

            tag['Tag'].filter((tagItem, index, array) => {
              let tmp = {
                id: tagItem['entity']['entityId'],
                name: tagItem['entity']['entityLabel'],
              };
              newsTagArr.push(tmp);
            });            
          });

          newsTagArr = newsTagArr.filter((thing, index, self) =>
            index === self.findIndex((t) => (
              t.id === thing.id && t.name === thing.name
            ))
          )
          this.newsTagObs = of(newsTagArr).pipe(delay(500));
          // console.log(newsTagArr)
        });
        
      }
    )
    
  }
  
  newsFilter() {
    this.tagEnabled = false;
    this.titleEnabled = false;
    
    console.log(this.filterFormGroup);
    
    // TAG FILTER
    if(this.filterFormGroup.value.newsTagsSelectForm != null) {  
      if(this.filterFormGroup.value.newsTagsSelectForm.length > 0) {  
        this.tagValue = this.filterFormGroup.value.newsTagsSelectForm.map((item) => { return item.id; })
        this.tagEnabled = true;
        // console.log(this.tagValue);
      }
    }
    
    // TITLE FILTER
    if(this.filterFormGroup.value.titleForm != null) {
      this.titleEnabled = true;
    }
    
    // DATE FILTER
    if(this.filterFormGroup.value.minDateForm != null) { 
      this.minDate = (this.filterFormGroup.value.minDateForm.getTime()/1000).toString();
    } else { this.minDate = "-2147483647"; }
    if(this.filterFormGroup.value.maxDateForm != null) {
      this.maxDate = (this.filterFormGroup.value.maxDateForm.getTime()/1000 + 86399).toString();
    } else { this.maxDate = "2147483647"; }
    // console.log(this.minDate)
    // console.log(this.maxDate)
    
    
    this.offset = 0;
    this.apollo.watchQuery({
      query: sortByOptions,
      variables: {
        tagValue: this.tagValue,
        tagEnabled: this.tagEnabled,
        titleValue: "%" + this.filterFormGroup.value.titleForm + "%",
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