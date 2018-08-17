import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Router, ActivatedRoute } from '@angular/router';
import { SingleQuery } from '../../_services/studyProgramme/studyProgramme.service';
import { FiltersService } from '../../_services/filters/filters.service';
import { Subscription } from 'rxjs/Subscription';

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

  constructor(
    private apollo: Apollo,
    public router: Router,
    public route: ActivatedRoute
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
    let subscribe = this.apollo.watchQuery({
      query: SingleQuery,
        variables: {
          path: this.path
        },
        fetchPolicy: 'no-cache',
        errorPolicy: 'all'
    }).valueChanges.subscribe( ({data}) => {

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