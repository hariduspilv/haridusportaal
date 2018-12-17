import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { FiltersService } from '@app/_services/filtersService';

import { RootScopeService } from '@app/_services/rootScopeService';
import 'rxjs/add/operator/map';

import { HttpService} from '@app/_services/httpService';

import * as _moment from 'moment';
const moment = _moment;

@Component({
  styleUrls: ['studyProgramme.styles.scss'],
  templateUrl: 'studyProgramme.template.html'
})

export class StudyProgrammeComponent extends FiltersService implements OnInit, OnDestroy{

  private today = moment().format('YYYY-MM-DD');
  public list:any = false;
  public listEnd: boolean;

  public loading: boolean = true;

  private lang: string;
  private path: string;
  private params: object;
  private limit: number = 5;
  private offset: number = 0;

  private filterFullProperties = ['location', 'language', 'level', 'school', 'iscedf_broad','iscedf_narrow','iscedf_detailed']

  filterFull: boolean = true;
  showFilter: boolean = true;

  private dataSubscription: Subscription;
  private filterOptionsSubscription: Subscription;
  private subscriptions: Subscription[] = [];

  private FilterOptions: object = {};
  private filterOptionKeys = ['type','level','language','iscedf_broad','iscedf_narrow','iscedf_detailed'];
  private isceList: object = {};
  
  constructor (
    private rootScope: RootScopeService,
    public router: Router,
    public route: ActivatedRoute, 
    private http: HttpService
  ) {
    super(null, null);
  }
  
  populateFilterOptions(){
    this.loading = true;
    if( this.filterOptionsSubscription !== undefined ){
      this.filterOptionsSubscription.unsubscribe();
    }
    
    let url = "/graphql?queryName=studyProgrammeFilterOptions&queryId=ca7e38bee7b0753e73a6813ba3ae20c9cce804fd:1&variables=";
    let variables = {
      lang: this.lang.toUpperCase()
    };
    
    let subscribe = this.http.get(url+JSON.stringify(variables)).subscribe( (response) => {
      let data = response['data'];
      if(data['isced_f'] !== undefined ){
        let iscedf_all = data['isced_f']['entities'];
        this.isceList['iscedf_broad'] = allocateIsceOptions(null, iscedf_all),
        this.isceList['iscedf_narrow'] = allocateIsceOptions(this.isceList['iscedf_broad'], iscedf_all),
        this.isceList['iscedf_detailed'] = allocateIsceOptions(this.isceList['iscedf_narrow'], iscedf_all),
        
        this.FilterOptions['iscedf_broad'] = this.isceList['iscedf_broad'];
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
      // this.filterFull = this.filterFullProperties.some(property => this.params[property] !== undefined )

      function allocateIsceOptions (parent, list){
       if(!parent) return list.filter(entity => entity.parentId == null);
       else return list.filter(entity => parent.some(parent => parent.entityId == entity.parentId) );
      } 
      this.loading = false;
      subscribe.unsubscribe();
    });

  }
  isValidAccreditation(date){
    //necessity pending on business logic decision #147
    return moment(date).isAfter(this.today);
  }
  
  isceChange(id: number, level: string){
    //Update options
    if(level == 'iscedf_broad'){
      this.clearField('iscedf_narrow');
      this.clearField('iscedf_detailed');
      if(id) this.FilterOptions['iscedf_narrow'] = this.isceList['iscedf_narrow'].filter(entity => entity.parentId == id );
      
    } else if ( level == 'iscedf_narrow'){
      this.clearField('iscedf_detailed');
      if(id) this.FilterOptions['iscedf_detailed'] = this.isceList['iscedf_detailed'].filter(entity => entity.parentId == id );
    }   
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
        this.lang = this.rootScope.get("lang");
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

    console.log(queryVars['title']);
    
    for(let i in this.filterOptionKeys){
      //this.searchParams[i]
      let key = this.filterOptionKeys[i];
      queryVars[key] = this.params[key] ? this.params[key].split(",") : undefined,
      queryVars[key + "Enabled"] = this.params[key] ? true : false
    }


    let url = "/graphql?queryName=studyProgrammeList&queryId=30bfa8638e3b0f2fdb9a5a5c747962bf13f69480:1&variables=";
    let variables = queryVars;
    
    let subscribe = this.http.get(url+JSON.stringify(variables) ).subscribe( (response) => {
      let data = response['data'];
      this.loading = false;

      if( data['nodeQuery']['entities'].length < this.limit ){ 
        this.listEnd = true;
      } else this.listEnd = false;

      this.list = this.list ? [...this.list, ...data['nodeQuery']['entities']] : data['nodeQuery']['entities'];

      subscribe.unsubscribe();

    });

  }

  ngOnInit() {

    this.showFilter = window.innerWidth > 1024;
    this.filterFull = window.innerWidth < 1024;
    
    this.pathWatcher();
    this.watchSearch();
    
    this.populateFilterOptions();
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