import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ListQuery, FilterOptions } from '../../_services/studyProgramme/studyProgramme.service';
import { Apollo, QueryRef } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription';
import { delay } from 'rxjs/operators/delay';
import { FiltersService } from '../../_services/filters/filters.service';
import { of } from 'rxjs/observable/of';
import { RootScopeService } from '../../_services/rootScope/rootScope.service';
import 'rxjs/add/operator/map';

import { Observable } from 'rxjs/Observable';

@Component({
  styleUrls: ['studyProgramme.styles.scss'],
  templateUrl: 'studyProgramme.template.html'
})

export class StudyProgrammeComponent extends FiltersService implements OnInit, OnDestroy{
  private list:any = false;
  private listEnd: boolean;

  private loading: boolean = true;

  private lang: string;
  private path: string;
  private params: object;
  private limit: number = 5;
  private offset: number = 0;

  private showFilter: boolean = true;
  private filterFullProperties = ['location', 'language', 'level', 'school', 'iscedf_board','iscedf_narrow','iscedf_detailed']

  filterFull: boolean = false;

  private dataSubscription: Subscription;
  private filterOptionsSubscription: Subscription;
  private subscriptions: Subscription[] = [];

  private FilterOptions: Object = {};
  private filterOptionKeys = ['type','level','language','iscedf_board','iscedf_narrow','iscedf_detailed'];

  private compare =  JSON.parse(localStorage.getItem("studyProgramme.compare")) || {};

  constructor (
    private rootScope: RootScopeService,
    public router: Router,
    public route: ActivatedRoute, 
    private apollo: Apollo
    
  ) {
    super(null, null);
  }
  populateFilterOptions(){
    this.loading = true;
    if( this.filterOptionsSubscription !== undefined ){
      this.filterOptionsSubscription.unsubscribe();
    }
    
    this.filterOptionsSubscription = this.apollo.watchQuery({
      query: FilterOptions,
      variables: {
        lang: "ET"
      },
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    }).valueChanges.subscribe( ({data}) => {
      
      this.loading = false;
    
      for(let i in this.filterOptionKeys){
        if( this.params[this.filterOptionKeys[i]] !== undefined ){
          this.filterFormItems[this.filterOptionKeys[i]] = parseInt(this.params[this.filterOptionKeys[i]]);
        }
        if(data[this.filterOptionKeys[i]]) {
          this.FilterOptions[this.filterOptionKeys[i]] = data[this.filterOptionKeys[i]]['entities'];
        }
      }
      for(let i in this.filterFullProperties){
        if(this.params[this.filterFullProperties[i]] !== undefined ){
          this.filterFull = true;
          break;
        }
      }
      this.filterOptionsSubscription.unsubscribe();

    });
  }
  compareChange(id, $event){
    $event.checked === true? this.compare[id] = true : delete this.compare[id];
    localStorage.setItem("studyProgramme.compare", JSON.stringify(this.compare));
   
  }
  setPaths() {
    this.rootScope.set('langOptions', {
      'en': '/en/study-programmes',
      'et': '/et/erialad'
    });
  }
  reset() {

    this.offset = 0;
    this.list = false;
    this.getData();
    
    
  }
  pathWatcher() { 
    let subscribe = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.path = this.router.url;
        this.lang = params['lang'];
      }
    );

    this.subscriptions = [...this.subscriptions, subscribe];
  }
  watchSearch() {

    let subscribe = this.route.queryParams.subscribe((params: ActivatedRoute) => {
      //console.log(params)
      this.params = params;
      this.reset();
    });

    this.filterRetrieveParams( this.params );

    // Add subscription to main array for destroying
    this.subscriptions = [ ...this.subscriptions, subscribe];
  }
  loadMore(){
    this.offset = this.list.length;
    this.loading = true;
    this.getData();
  }
  getData() {
    
    this.loading = true;
    if( this.dataSubscription !== undefined ){
      this.dataSubscription.unsubscribe();
    }
    //todo: automate searchParams injection
    let queryVars = {
      lang: this.lang.toUpperCase(),
      offset: this.offset,
      limit: this.limit,
      title: this.params['title'] ? "%"+this.params['title']+"%" : "%%",
      titleEnabled: this.params['title'] ? true: false,
      school: this.params['school'] ? "%"+this.params['school']+"%" : "%%",
      schoolEnabled: this.params['school'] ? true: false,
      location: this.params['location'] ? "%"+this.params['location']+"%" : "%%",
      locationEnabled: this.params['location'] ? true: false,
      onlyOpenAdmission: this.params['open_admission'] ? true: false,
  
    }
    for(let i in this.filterOptionKeys){
      //this.searchParams[i]
      let key = this.filterOptionKeys[i];
      queryVars[key] = this.params[key] ? this.params[key].split(",") : undefined,
      queryVars[key + "Enabled"] = this.params[key] ? true : false
    }
    this.dataSubscription = this.apollo.watchQuery({
      query: ListQuery,
      variables: queryVars,
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    }).valueChanges.subscribe( ({data}) => {

      this.loading = false;

      if( data['nodeQuery']['entities'].length < this.limit ){ 
        this.listEnd = true;
      } else this.listEnd = false;

      this.list = this.list ? [...this.list, ...data['nodeQuery']['entities']] : data['nodeQuery']['entities'];

      this.dataSubscription.unsubscribe();

    });

  }

  ngOnInit() {
    

    this.populateFilterOptions();
    this.setPaths();
    this.pathWatcher();
    this.watchSearch();
    this.filterFormItems.open_admission = true; //default
    this.filterSubmit();
  }
  ngOnDestroy() {
    /* Clear all subscriptions */
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
  
}