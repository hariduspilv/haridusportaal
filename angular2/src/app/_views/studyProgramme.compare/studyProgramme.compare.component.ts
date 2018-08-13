import { Component, OnInit, OnDestroy } from '@angular/core';
import { RootScopeService } from '../../_services/rootScope/rootScope.service';
import { Http } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { SettingsService } from '../../_core/settings';
import { Subscription } from 'rxjs/Subscription';
import { CompareComponent } from '../../_components/compare/compare.component';
@Component({
  templateUrl: "studyProgramme.compare.template.html",
  styleUrls: ["studyProgramme.compare.styles.scss"]
})


export class StudyProgrammeCompareComponent extends CompareComponent implements OnInit,OnDestroy {

  public error;
  private url;
  private lang: string;
  private path: string;
  public list: any = false;
  private subscriptions: Subscription[] = [];

  constructor (
    public route: ActivatedRoute, 
    public router: Router,
    private http: Http,
    private rootScope: RootScopeService,
    private settings: SettingsService
  ) {
    super()
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
  setPaths() {
    this.rootScope.set('langOptions', {
      'en': '/en/study-programmes/compare/',
      'et': '/et/erialad/vordlus'
    });
  }
  removeItemFromList(id){
    this.compareChange(id, false)
    this.list = this.list.filter(item => item.nid != id);
  }
  getData(){
    if(!this.compare.length) return this.error = "ERROR?";

    let studyProgrammeIDs:any = '[' + this.compare.map(id => '"'+id+'"') + ']';
    console.log(studyProgrammeIDs)

    let lang = "%22" + this.lang.toUpperCase() + "%22"

    let variables = "&variables={%22lang%22:"+ lang +",%22nidValues%22:"+ studyProgrammeIDs +"}";

    this.url = this.settings.url + "/graphql?queryId=studyProgrammeComparison:1" + variables;
    //console.log(studyProgrammeIDs);
    
    this.http.get(this.url).subscribe(response => {
      let _response = JSON.parse(JSON.stringify(response));
      
      this.list = JSON.parse(_response._body).data.nodeQuery.entities;
      console.log(this.list);
    });
  }
  ngOnInit() {
    this.pathWatcher()
    this.setPaths();
    this.getData();
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
