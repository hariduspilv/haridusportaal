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
import * as _moment from 'moment';
const moment = _moment;
import { Observable } from 'rxjs/Observable';
import { identifierModuleUrl } from '../../../../node_modules/@angular/compiler';

@Component({
  styleUrls: ['studyProgramme.styles.scss'],
  templateUrl: 'studyProgramme.template.html'
})

export class StudyProgrammeComponent extends FiltersService implements OnInit, OnDestroy{
<<<<<<< HEAD
  private today = moment().format('YYYY-MM-DD');
  private list:any = false;
  private listEnd: boolean;
  
=======
  public list:any = false;
  public listEnd: boolean;

>>>>>>> 60f88628a84b659a6ee69f5864566d3106b0624c
  private loading: boolean = true;

  private lang: string;
  private path: string;
  private params: object;
  private limit: number = 5;
  private offset: number = 0;

  public showFilter: boolean = true;
  private filterFullProperties = ['location', 'language', 'level', 'school', 'iscedf_board','iscedf_narrow','iscedf_detailed']

  filterFull: boolean = false;

  private dataSubscription: Subscription;
  private filterOptionsSubscription: Subscription;
  private subscriptions: Subscription[] = [];

  private FilterOptions: object = {};
  private filterOptionKeys = ['type','level','language','iscedf_board','iscedf_narrow','iscedf_detailed'];
  private isceList: object = {};
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

      
      if(data['isced_f'] !== undefined ){
        let iscedf_all = data['isced_f']['entities'];
        this.isceList['iscedf_board'] = allocateIsceOptions(null, iscedf_all),
        this.isceList['iscedf_narrow'] = allocateIsceOptions(this.isceList['iscedf_board'], iscedf_all),
        this.isceList['iscedf_detailed'] = allocateIsceOptions(this.isceList['iscedf_narrow'], iscedf_all),
        
        this.FilterOptions['iscedf_board'] = this.isceList['iscedf_board'];
      }
      for(let i in this.filterOptionKeys){
        //if URL params contains valid key
        if( this.params[this.filterOptionKeys[i]] !== undefined ){
          //if valid key includes iscedf
          if(this.filterOptionKeys[i].includes('iscedf') && data['isced_f'] !== undefined) {
            //populate options 
            this.isceChange(parseInt(this.params[this.filterOptionKeys[i]]), this.filterOptionKeys[i])
            //set selected isce option
            this.filterFormItems[this.filterOptionKeys[i]] = this.params[this.filterOptionKeys[i]];
          } else {
            //set selected option
            this.filterFormItems[this.filterOptionKeys[i]] = parseInt(this.params[this.filterOptionKeys[i]]);
          }
        }
        //Populate FilterOptions
        if( data[this.filterOptionKeys[i]] ) {
          this.FilterOptions[this.filterOptionKeys[i]] = data[this.filterOptionKeys[i]]['entities'];
        }
      }
      //Determine whether to open detailed filter view or not based on what URL params we have
      this.filterFull = this.filterFullProperties.some(property => this.params[property] !== undefined )

      function allocateIsceOptions (parent, list){
       if(!parent) return list.filter(entity => entity.parentId == null);
       else return list.filter(entity => parent.some(parent => parent.entityId == entity.parentId) );
      } 
      this.loading = false;
      this.filterOptionsSubscription.unsubscribe();
    });
  }
  isValidAccreditation(date){
    //console.log('date: %s is after %s: %s', date, this.today, moment(date).isAfter(this.today));
    return moment(date).isAfter(this.today);
  }
  compareChange(id, $event){
    $event.checked === true? this.compare[id] = true : delete this.compare[id];
    localStorage.setItem("studyProgramme.compare", JSON.stringify(this.compare));
  }
  
  isceChange(id: number, level: string){
    //Update options
    if(level == 'iscedf_board'){
      this.clearField('iscedf_narrow');
      this.clearField('iscedf_detailed');
      if(id) this.FilterOptions['iscedf_narrow'] = this.isceList['iscedf_narrow'].filter(entity => entity.parentId == id );
      
    } else if ( level == 'iscedf_narrow'){
      this.clearField('iscedf_detailed');
      if(id) this.FilterOptions['iscedf_detailed'] = this.isceList['iscedf_detailed'].filter(entity => entity.parentId == id );
    }   
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
      //console.log(this.list);
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