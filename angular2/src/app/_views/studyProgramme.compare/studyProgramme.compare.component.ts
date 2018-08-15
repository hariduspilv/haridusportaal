import { Component, OnInit, OnDestroy } from '@angular/core';
import { RootScopeService } from '../../_services/rootScope/rootScope.service';
import { HttpClient } from '@angular/common/http';
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
  public compare = JSON.parse(localStorage.getItem('studyProgramme.compare')) || [];
  public error;
  private url;
  private lang: string;
  private path: string;
  public list: any = false;
  private subscriptions: Subscription[] = [];

  constructor (
    public route: ActivatedRoute, 
    public router: Router,
    private http: HttpClient,
    public rootScope: RootScopeService,
    private settings: SettingsService
  ) {
    super(null, null, null, null)
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
  removeItemFromList(id, localStorageKey){
    let existing = this.readFromLocalStorage(localStorageKey);
    this.removeItemFromLocalStorage(id, localStorageKey, existing)
    this.list = this.list.filter(item => item.nid != id);
  }
  getData(){
    if(!this.compare.length) return this.error = "ERROR?";

    let variables = {
      lang: this.lang.toUpperCase(),
      nidValues: '[' + this.compare.map(id => '"'+id+'"') + ']'
    }

    this.url = this.settings.url + "/graphql?queryId=studyProgrammeComparison:1&variables=" + JSON.stringify(variables);
    
    this.http.get(this.url).subscribe(response => {
      this.list = response['data'].nodeQuery.entities;
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
