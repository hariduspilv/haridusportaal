import { Component, OnInit, OnDestroy } from '@angular/core';
import { RootScopeService } from '../../_services/rootScope/rootScope.service';
import { Http } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { SettingsService } from '../../_core/settings';
import { Subscription } from 'rxjs/Subscription';
@Component({
  templateUrl: "studyProgramme.compare.template.html",
  styleUrls: ["studyProgramme.compare.styles.scss"]
})


export class StudyProgrammeCompareComponent implements OnInit,OnDestroy {

  private compare =  JSON.parse(localStorage.getItem("studyProgramme.compare")) || {};
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
  ) {}
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
  removeItemFromCompare(id){
    //todo: Remove studyprogramme from list and from localStorage
    console.log(id);
    delete this.compare[id];
    this.list = this.list.filter(item => item.nid !== id );
    localStorage.setItem("studyProgramme.compare", JSON.stringify(this.compare));
  }
  getData(){
    if(!Object.keys(this.compare).length) return this.error = "ERROR?";

    let studyProgrammeIDs:any = '[' + Object.keys(this.compare).map(id => encodeURI('"'+id+'"')).join(",") + ']';

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
