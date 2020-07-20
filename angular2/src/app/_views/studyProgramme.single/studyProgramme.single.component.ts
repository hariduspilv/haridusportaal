import { Component, OnInit, Input, HostListener } from '@angular/core';
import { Router, ActivatedRoute, Event, NavigationStart } from '@angular/router';
import { FiltersService } from '@app/_services/filtersService';
import { Subscription } from 'rxjs/Subscription';
import { UserService } from '@app/_services/userService';

import { HttpService } from '@app/_services/httpService';
import { RootScopeService } from '@app/_services';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: "study-programme-component",
  templateUrl: "studyProgramme.single.template.html",
  styleUrls: ["studyProgramme.single.styles.scss"]
})

export class StudyProgrammeSingleComponent extends FiltersService implements OnInit{

  @Input() inputData;
  parseFloat = parseFloat;
  path: any;
  data: any;
  error: boolean = false;
  map: any;
  displayRelatedStudyProgrammes: boolean;
  private subscriptions: Subscription[] = [];
  private params: object;
  private recentUrl: string = '';
  private userLoggedOut: boolean = false;
  private desktopView: boolean;
  public relatedInitialized: boolean = false;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private user: UserService,
    private http: HttpService,
    private rootScope: RootScopeService,
    private device: DeviceDetectorService
  ){
    super(null,null)
  }
  watchSearch() {
    let subscribe = this.route.queryParams.subscribe((params: ActivatedRoute) => {
      this.params = params;
      if(this.params['displayRelated']) {
        this.toggleDisplayRelatedStudyProgrammes(true);
      } else {
        this.relatedInitialized = true;
      }
    });

    let routerSub = this.router.events.subscribe((event: Event) => { 
      if (event instanceof NavigationStart) {
        if (event.url.split('?')[0] !== this.recentUrl && this.recentUrl) {
          this.relatedInitialized = false;
        }
        this.recentUrl = event.url.split('?')[0];
      }
    })

    this.filterRetrieveParams( this.params );

    // Add subscription to main array for destroying
    this.subscriptions = [ ...this.subscriptions, subscribe, routerSub];
  }
  toggleDisplayRelatedStudyProgrammes(value){
    this.displayRelatedStudyProgrammes = value;
  }

  returnEntityString (entity) {
    if (Array.isArray(entity)) {
      const values = entity.map(val => val.entity.entityLabel);
      return values.join(', ');
    }
    return entity;
  }

  getData() {

    this.data = false;
    this.displayRelatedStudyProgrammes = false;


    if( this.inputData ){
      this.data = this.inputData;
    }else{
      let variables = {
        path: this.path
      };
      let subscribe = this.http.get('studyProgrammeSingle', {params:variables}).subscribe( (response) => {
        let data = response['data'];
        this.data = data['route']['entity'];
      });
      // Add subscription to main array for destroying
      this.subscriptions = [ ...this.subscriptions, subscribe];
    }

  }
  onInitialized() {
    this.relatedInitialized = true;
  }

  ngOnInit() {
    this.desktopView = this.device.isDesktop();
    this.watchSearch();
    this.route.params.subscribe( params => {
      
      if(this.path !== this.router.url ){
        this.path = this.router.url.split("?")[0];
        this.getData();
        if(this.params['displayRelated']) {
          this.toggleDisplayRelatedStudyProgrammes(true);
        } else {
          this.relatedInitialized = true;
        }
        window.scrollTo(0, 0);
      }
      this.userLoggedOut = this.user.getData()['isExpired'];
    });
  }
  ngOnDestroy(){
    /* Clear all subscriptions */
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
    this.relatedInitialized = false;
 }
 @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.rootScope.set('scrollRestorationState', true);
  }
}