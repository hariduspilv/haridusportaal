import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FiltersService } from '@app/_services/filtersService';
import { Subscription } from 'rxjs/Subscription';
import { UserService } from '@app/_services/userService';

import { HttpService } from '@app/_services/httpService';

@Component({
  templateUrl: "studyProgramme.single.template.html",
  styleUrls: ["studyProgramme.single.styles.scss"]
})

export class StudyProgrammeSingleComponent extends FiltersService implements OnInit{

  parseFloat = parseFloat;
  path: any;
  data: any;
  error: boolean = false;
  map: any;
  displayRelatedStudyProgrammes: boolean;
  private subscriptions: Subscription[] = [];
  private params: object;
  private userLoggedOut: boolean = false;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private user: UserService,
    private http: HttpService
  ){
    super(null,null)
  }
  watchSearch() {
    let subscribe = this.route.queryParams.subscribe((params: ActivatedRoute) => {
      this.params = params;
      if(this.params['displayRelated']) this.toggleDisplayRelatedStudyProgrammes(true);
    });

    this.filterRetrieveParams( this.params );

    // Add subscription to main array for destroying
    this.subscriptions = [ ...this.subscriptions, subscribe];
  }
  toggleDisplayRelatedStudyProgrammes(value){
    this.displayRelatedStudyProgrammes = value;
  }
  getData() {
    this.displayRelatedStudyProgrammes = false;


    let url = "/graphql?queryName=studyProgrammeSingle&queryId=0d539972ed54436d5d651243ee7754c2d81a5efc:1&variables=";
    let variables = {
      path: this.path
    };
    
    let subscribe = this.http.get(url+JSON.stringify(variables)).subscribe( (response) => {
      let data = response['data'];
      this.data = data['route']['entity'];
    });
    // Add subscription to main array for destroying
    this.subscriptions = [ ...this.subscriptions, subscribe];
  }

  ngOnInit() {
    this.watchSearch();
    
    this.route.params.subscribe( params => {
      
      if(this.path !== this.router.url ){
        this.path = this.router.url;
        this.getData();
        if(this.params['displayRelated']) this.toggleDisplayRelatedStudyProgrammes(true);
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
 }
}