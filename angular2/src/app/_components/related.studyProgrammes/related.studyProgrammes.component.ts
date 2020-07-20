import { Component, Input, Output, OnInit, OnDestroy, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { RootScopeService } from '@app/_services/rootScopeService';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { SettingsService } from '@app/_services/settings.service';
import { Subscription } from 'rxjs/Subscription';
import { FiltersService } from '@app/_services/filtersService';
import { HttpService } from '@app/_services/httpService';
import { ScrollRestorationService } from '@app/_services';
@Component({
  selector: "related-studyprogrammes",
  templateUrl: "related.studyProgrammes.component.html",
  styleUrls: ["related.studyProgrammes.component.scss"]
})

export class RelatedStudyProgrammesComponent extends FiltersService implements OnInit, OnDestroy {
  @ViewChild('content') content: ElementRef;
  
  @Input() studyProgrammeId: number;
  @Output() initialized = new EventEmitter<boolean>();

  private url;
  private lang: string;
  private subscriptions: Subscription[] = [];
  private requestSub: Subscription;
  private params: object;

  public limit: number = 24;
  public offset: number = 0;
  public listCount: number = 0;
  public loading: boolean = true;
  public listEnd: boolean = false;

  public list: any = false;
  public search_address;
  public scrollPositionSet: boolean = false;
  public oldSearchAddress;

  constructor (
    public route: ActivatedRoute, 
    public router: Router,
    private http: HttpService,
    public rootScope: RootScopeService,
    private scrollRestoration: ScrollRestorationService
  ) { 
    super(null, null)
  }

  watchSearch() {

    
    let subscribe = this.route.queryParams.subscribe((params: ActivatedRoute) => {
      this.params = params;
      this.getData();
    });

    this.filterRetrieveParams( this.params );

    // Add subscription to main array for destroying
    this.subscriptions = [ ...this.subscriptions, subscribe];
  }

  getData(){
    if(this.params && !this.params['displayRelated']) return;
    let variables = {
      lang: this.lang.toUpperCase(),
      nid: this.studyProgrammeId.toString(),
      limit: this.limit,
      offset: this.list ? this.list.length : 0
    }

    if (this.oldSearchAddress !== this.params['location']) {
      variables.offset = 0;
      this.list = [];
    }
    this.oldSearchAddress = this.params['location'];

    this.initialScrollRestorationSetup(variables);

    this.loading = true;

    if(this.params['location']) variables['address'] = this.params['location'];
    if(this.requestSub !== undefined) {
      this.requestSub.unsubscribe();
    }
    this.requestSub = this.http.get('similarStudyProgrammes2', { params: variables } ).subscribe(response => {

      this.loading = false;
      let tmpList: any = null;
      if (response['data']['CustomStudyProgrammeElasticQuery2']) {
        this.listCount = response['data']['CustomStudyProgrammeElasticQuery2']['count'];
        tmpList = response['data']['CustomStudyProgrammeElasticQuery2']['entities'];
      }
      if (response['errors'] && tmpList === null) {
        tmpList = [];
      }

      tmpList.forEach(programme => {
        //convert string to number
        programme.Nid = parseInt(programme.Nid);
        //Split CSV of teaching languages to an array
        if( programme.FieldTeachingLanguage ){
          programme.FieldTeachingLanguage = programme.FieldTeachingLanguage.split(',');
        }
      })

      if( tmpList.length < this.limit ){
        this.listEnd = true;
      }

      if( this.list ){
        this.list = [ ... this.list, ...tmpList ];
      }else{
        this.list = tmpList;
      }

      if (this.listCount === this.list.length) {
        this.listEnd = true;
      }

      this.requestSub.unsubscribe();
      this.initialized.emit(true);
    },
      error => {
        this.loading = false;
        this.listEnd = true;
        this.initialized.emit(true);
      }
    );
  }
  ngOnInit() {

    this.lang = this.rootScope.get("lang");

    //make sure related study programmes are opened when user returns to this url via browser back button/link share
    this.filterFormItems['displayRelated'] = 'true';
    this.filterSubmit();
    this.watchSearch();
  }
  ngOnDestroy(){
    /* Clear all subscriptions */
    if (this.requestSub) this.requestSub.unsubscribe();
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
    if (this.scrollRestoration.hashRoute 
      && !this.scrollRestoration.scrollableRoutes.includes(this.scrollRestoration.currentRoute) 
      && this.scrollRestoration.currentRoute !== decodeURI(window.location.pathname)) {
      this.scrollRestoration.setRouteKey('limit', this.list.length);
    }
  }

  initialScrollRestorationSetup(hash) {
    let scrollData = this.scrollRestoration.getRoute(decodeURI(window.location.pathname));
    if (scrollData && this.rootScope.get('scrollRestorationState')) {
      this.offset = !this.list && scrollData.limit ? scrollData.limit - this.limit : (this.list && this.list.length || 0);
      hash['offset'] = !this.list ? 0 : this.offset;
      hash['limit'] = (!this.list && scrollData.limit) ? scrollData.limit : this.limit;
    }
  }

  ngAfterViewChecked() {
    if (!this.scrollPositionSet && this.content && this.content.nativeElement.offsetParent != null) {
      if (this.scrollRestoration.currentRoute === decodeURI(window.location.pathname)) {
        this.scrollRestoration.setScroll();
        this.scrollPositionSet = true;
        this.rootScope.set('scrollRestorationState', false);
      }
    }
  }

}