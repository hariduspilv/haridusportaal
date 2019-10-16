import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core'
import { Router, ActivatedRoute, Params, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { FiltersService } from '@app/_services/filtersService';

import { RootScopeService } from '@app/_services/rootScopeService';
import 'rxjs/add/operator/map';

import { HttpService} from '@app/_services/httpService';

import * as _moment from 'moment';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ScrollRestorationService } from '@app/_services';
const moment = _moment;

@Component({
  styleUrls: ['studyProgramme.styles.scss'],
  templateUrl: 'studyProgramme.template.html'
})

export class StudyProgrammeComponent extends FiltersService implements OnInit, OnDestroy{
  @ViewChild('content') content: ElementRef;

  private today = moment().format('YYYY-MM-DD');
  public list:any = false;
  public listEnd: boolean;

  public loading: boolean = true;

  private lang: string;
  private path: string;
  private params: any;
  private limit: number = 24;
  private offset: number = 0;

  private filterFullProperties = ['location', 'language', 'level', 'school', 'iscedf_broad','iscedf_narrow','iscedf_detailed', 'sortDirection']

  filterFull: boolean = true;
  showFilter: boolean = true;

  private dataSubscription: Subscription;
  private filterOptionsSubscription: Subscription;
  private subscriptions: Subscription[] = [];

  private FilterOptions: object = {};
  private filterOptionKeys = ['type','level','language','iscedf_broad','iscedf_narrow','iscedf_detailed'];
  private isceList: any = {};
  public scrollPositionSet: boolean = false;
  public areFiltersCleared: boolean = false;

  private mouseListener: any = null;
  
  constructor (
    private rootScope: RootScopeService,
    public router: Router,
    public route: ActivatedRoute, 
    private http: HttpService,
    private device: DeviceDetectorService,
    public scrollRestoration: ScrollRestorationService,
  ) {
    super(null, null);

    }
  
  populateFilterOptions(){
    this.loading = true;
    if( this.filterOptionsSubscription !== undefined ){
      this.filterOptionsSubscription.unsubscribe();
    }
    
    let variables = {
      lang: this.lang.toUpperCase()
    };
    
    let subscribe = this.http.get('studyProgrammeFilterOptions', {params:variables}).subscribe( (response) => {
      let data = response['data'];
      if(data['isced_f'] !== undefined ){
        let iscedf_all = data['isced_f']['entities'];
        this.isceList['iscedf_broad'] = allocateIsceOptions(null, iscedf_all),
        this.isceList['iscedf_narrow'] = allocateIsceOptions(this.isceList['iscedf_broad'], iscedf_all),
        this.isceList['iscedf_detailed'] = allocateIsceOptions(this.isceList['iscedf_narrow'], iscedf_all),
        this.FilterOptions['iscedf_broad'] = this.isceList['iscedf_broad'];
      }
      for(let i in this.filterOptionKeys){
        //Populate FilterOptions
        if( data[this.filterOptionKeys[i]] ) {
          this.FilterOptions[this.filterOptionKeys[i]] = data[this.filterOptionKeys[i]]['entities'];
        }
        //if URL params contains valid key
        if( this.params[this.filterOptionKeys[i]] !== undefined ){
          //if valid key includes iscedf
          if(this.filterOptionKeys[i].includes('iscedf') && data['isced_f'] !== undefined) {
            //populate options
            const isceArr = this.params[this.filterOptionKeys[i]].split(',').map(e => parseInt(e));
            this.isceChange(isceArr, this.filterOptionKeys[i])
            //set selected isce option
            this.filterFormItems[this.filterOptionKeys[i]] = this.params[this.filterOptionKeys[i]].split(',');
          } else {
            //set selected option
            switch (this.filterOptionKeys[i]) {
              case 'level':
              case 'language':
              case 'type':
                this.filterFormItems[this.filterOptionKeys[i]] = this.params[this.filterOptionKeys[i]].split(',').map(e => parseInt(e))
                break;
              default:
                this.filterFormItems[this.filterOptionKeys[i]] = parseInt(this.params[this.filterOptionKeys[i]]);
                break;
            }
          }
        }
        this.entityLabelSort(false, this.filterOptionKeys[i]);
      }
      //don't judge
      //if detailed exists but no narrow, reverse search narrow and broad

      if(this.filterFormItems.iscedf_detailed && ((this.filterFormItems.iscedf_narrow === false) || !this.filterFormItems.iscedf_narrow)) {
        const iscedfDetailedFull = this.isceList['iscedf_detailed'].filter((e) => {
          return this.filterFormItems['iscedf_detailed'].find(x => x === e.entityId);
        });
        const filteredNarrows = iscedfDetailedFull.map((detailed) => {
          return this.isceList['iscedf_narrow'].find(x => parseInt(x.entityId) === detailed.parentId);
        });
        const filteredBroads = filteredNarrows.map((narrow) => {
          return this.isceList['iscedf_broad'].find(x => parseInt(x.entityId) === narrow.parentId);
        });
        this.filterFormItems['iscedf_broad'] = filteredBroads.map(e => e.entityId);
        this.FilterOptions['iscedf_narrow'] = filteredNarrows;
        this.filterFormItems['iscedf_narrow'] = filteredNarrows.map(e => e.entityId);
        this.FilterOptions['iscedf_detailed'] = iscedfDetailedFull;
      }
      //if narrow exists but no broad, reverse search broad
      if(this.filterFormItems.iscedf_narrow && ((this.filterFormItems.iscedf_broad === false) || !this.filterFormItems.iscedf_broad)) {
        const iscedfNarrowFull = this.isceList['iscedf_narrow'].filter((narrow) => {
          return this.filterFormItems['iscedf_narrow'].find(x => x === narrow.entityId);
        });
        const filteredBroads = iscedfNarrowFull.map((narrow) => {
          return this.isceList['iscedf_broad'].find(x => parseInt(x.entityId) === narrow.parentId);
        });
        this.filterFormItems['iscedf_broad'] = filteredBroads.map(e => e.entityId);
        this.FilterOptions['iscedf_narrow'] = iscedfNarrowFull;
        this.filterFormItems['iscedf_narrow'] = iscedfNarrowFull.map(e => e.entityId);
        this.FilterOptions['iscedf_detailed'] = this.isceList['iscedf_detailed'].filter(e => {
          return this.filterFormItems['iscedf_narrow'].find(x => {
            return e.parentId === parseInt(x)
          });
        });
      }
      //Determine whether to open detailed filter view or not based on what URL params we have
      if(this.device.isDesktop()){
        this.filterFull = this.filterFullProperties.some(property => this.params[property] !== undefined )
      }
      if (this.rootScope.get('scrollRestorationState') && Object.keys(this.filterFormItems).length === 0) {
        this.filterFull = true;
      }

      function allocateIsceOptions (parent, list){
       if(!parent) return list.filter(entity => entity.parentId == null);
       else return list.filter(entity => parent.some(parent => parent.entityId == entity.parentId) );
      } 
      this.loading = false;
      subscribe.unsubscribe();
    });

  }

  openDropdown(elem) {
    document.getElementById(elem).click();
  }

  entityLabelSort(e, prop) {
    if(!e) {
      let sortedSelected = [];
      let otherValues = [];
      if(this.filterFormItems[prop] && this.FilterOptions[prop]){
        sortedSelected = this.FilterOptions[prop].filter(el => this.filterFormItems[prop].find(value => parseInt(value) === parseInt(el.tid || el.entityId))).sort((a, b) => {
          if(a.entityLabel.toUpperCase() < b.entityLabel.toUpperCase()) {
            return -1;
          }
          return 1;
        });
        otherValues = this.FilterOptions[prop].filter(el => !sortedSelected.find(value => parseInt(value.tid || value.entityId) === parseInt(el.tid || el.entityId))).sort((a, b) => {
          if(a.entityLabel.toUpperCase() < b.entityLabel.toUpperCase()) {
            return -1;
          }
          return 1;
        });
      } else if(this.FilterOptions[prop]) {
        otherValues = this.FilterOptions[prop].sort((a, b) => {
          if(a.entityLabel.toUpperCase() < b.entityLabel.toUpperCase()) {
            return -1;
          }
          return 1;
        })
      }
      this.FilterOptions[prop] = [...sortedSelected, ...otherValues];
    }
  }

  isValidAccreditation(date){
    //necessity pending on business logic decision #147
    return moment(date).isAfter(this.today);
  }
  
  isceChange(id: any, level: string){
    //Update options
    if(level == 'iscedf_broad'){

      // this.clearField('iscedf_narrow');
      // this.clearField('iscedf_detailed');
      this.filterFormItems.iscedf_narrow = [];
      this.filterFormItems.iscedf_detailed = []
      if(id) {
        this.FilterOptions['iscedf_narrow'] = this.isceList['iscedf_narrow'].filter((entity) => {
          return id.find(e => entity.parentId === parseInt(e));
        });
        this.entityLabelSort(false, 'iscedf_narrow');
      }
    } else if ( level == 'iscedf_narrow'){
      // this.clearField('iscedf_detailed');
      this.filterFormItems.iscedf_detailed = [];
      if(id) {
        this.FilterOptions['iscedf_detailed'] = this.isceList['iscedf_detailed'].filter((entity) => {
          return id.find(e => entity.parentId === parseInt(e));
        });
        this.entityLabelSort(false, 'iscedf_detailed');
      }
    }
  }

  clearForm() {
    Object.keys(this.filterFormItems).forEach(e => {
      this.clearField(e);
      this.params[e] = '';
      this.router.navigate([]);
    })
    this.areFiltersCleared = true;
    setTimeout(() => {
      this.areFiltersCleared = false;
    }, 1000)
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
      const paramsKeys = Object.keys(params);
      const newParams = {};
      paramsKeys.forEach((e) => {
        if(this.params[e] instanceof Array) {
          newParams[e] = this.params[e].join();
        } else {
          newParams[e] = this.params[e];
        }
      });
      this.params = newParams;
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
    if(!this.filterFull) {
      this.filterFull = this.filterFullProperties.some(property => this.params[property] !== undefined );
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
      sortField: this.params['sortDirection'] ? 'field_duration' : 'title',
      sortDirection: this.params['sortDirection'] ? this.params['sortDirection'] : 'ASC',
    }
    
    for(let i in this.filterOptionKeys){
      //this.searchParams[i]
      let key = this.filterOptionKeys[i];
      queryVars[key] = this.params[key] ? this.params[key].split(",") : undefined,
      queryVars[key + "Enabled"] = this.params[key] ? true : false
    }
    let variables = queryVars;
    this.initialScrollRestorationSetup(variables);
    
    this.dataSubscription = this.http.get('studyProgrammeList', {params:variables}).subscribe( (response) => {
      let data = response['data'];
      this.loading = false;

      if( data['nodeQuery']['entities'].length < this.limit ){ 
        this.listEnd = true;
      } else this.listEnd = false;

      this.list = this.list ? [...this.list, ...data['nodeQuery']['entities']] : data['nodeQuery']['entities'];
      this.dataSubscription.unsubscribe();

    });

  }

  ngOnInit() {
    this.showFilter = this.device.isDesktop();
    this.filterFull = this.device.isTablet() || this.device.isMobile();
    this.pathWatcher();
    this.watchSearch();
    this.populateFilterOptions();
    // if no selections made
    if(Object.keys(this.filterFormItems).length === 0 && !this.rootScope.get('scrollRestorationState')) {
      this.filterFormItems.open_admission = true; //default
    }
    if(typeof this.filterFormItems.type === "string") {
      this.filterFormItems.type = this.filterFormItems.type.split(',').map(e => parseInt(e));
    }
    this.filterSubmit();
    this.mouseListener = (el: any) => { 
      if(el.target.attributes['href'] && el.target.attributes['href'].value === '/erialad') {
        this.router.navigate([], { queryParams: { open_admission: true}})
        Object.keys(this.filterFormItems).forEach(e => {
          this.clearField(e);
          this.params[e] = '';
        })
        this.filterFormItems.open_admission = true;
      }
    }
    document.addEventListener('click', this.mouseListener);
  }
  ngOnDestroy() {
    this.list = false;
    /* Clear all subscriptions */
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
    if (this.scrollRestoration.scrollableRoutes.includes(this.scrollRestoration.currentRoute)) {
      this.scrollRestoration.setRouteKey('limit', this.limit + this.offset)
    }
    document.removeEventListener('click', this.mouseListener);
  }
  
  setFocus(id) {
    document.getElementById(id).focus();
  }
  initialScrollRestorationSetup(hash) {
    let scrollData = this.scrollRestoration.getRoute(decodeURI(window.location.pathname));
    if (scrollData && this.rootScope.get('scrollRestorationState')) {
      this.offset = !this.list && scrollData.limit ? scrollData.limit - this.limit : this.offset;
      hash['offset'] = !this.list ? 0 : this.offset;
      hash['limit'] = (!this.list && scrollData.limit) ? scrollData.limit : this.limit;
    }
  }

  ngAfterViewChecked() {
    if (!this.scrollPositionSet && this.content && this.content.nativeElement.offsetParent != null) {
      this.scrollRestoration.setScroll();
      this.scrollPositionSet = true;
    }
  }
}