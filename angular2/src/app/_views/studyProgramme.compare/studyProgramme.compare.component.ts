import { Component, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { RootScopeService } from '@app/_services/rootScopeService';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { SettingsService } from '@app/_core/settings';
import { Subscription } from 'rxjs/Subscription';
import { CompareComponent } from '@app/_components/compare/compare.component';
import { TableService } from '@app/_services/tableService';

@Component({
  templateUrl: "studyProgramme.compare.template.html",
  styleUrls: ["studyProgramme.compare.styles.scss"]
})

export class StudyProgrammeCompareComponent extends CompareComponent implements OnInit, AfterViewChecked, OnDestroy {
  public compare = JSON.parse(sessionStorage.getItem('studyProgramme.compare')) || [];
  public error;
  private url;
  private lang: string;
  private path: string;
  public list: any = false;
  private subscriptions: Subscription[] = [];
  tableOverflown: boolean = false;
  elemAtStart: boolean = true;
  initialized: boolean = false;

  constructor (
    public route: ActivatedRoute, 
    public router: Router,
    private http: HttpClient,
    public rootScope: RootScopeService,
    private settings: SettingsService,
    private tableService: TableService
  ) {
    super(null, null, null, null, null, null)
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

  rerouteToParent(): void {
    let currentUrl = JSON.parse(JSON.stringify(this.path.split('/')));
    currentUrl.pop();
    
    let parentUrl = currentUrl.join('/');
    this.router.navigateByUrl(parentUrl);
  }
  removeItemFromList(id, sessionStorageKey){
    let existing = this.readFromLocalStorage(sessionStorageKey);
    this.removeItemFromLocalStorage(id, sessionStorageKey, existing)
    this.list = this.list.filter(item => item.nid != id);
    
    if(!this.list.length) this.rerouteToParent();
  }
  getData(){

    let variables = {
      lang: this.lang.toUpperCase(),
      nidValues: '[' + this.compare.map(id => '"'+id+'"') + ']'
    }
    
    this.http.get('studyProgrammeComparison', {params:variables}).subscribe(response => {
      this.list = response['data'].nodeQuery.entities;
      if(!this.list.length) this.rerouteToParent();
    });
  }
 
  ngOnInit() {
    
    this.pathWatcher();
    this.getData();
  }
  ngAfterViewChecked() {
    this.initialTableCheck('tableRef')
  }
  ngOnDestroy() {
    /* Clear all subscriptions */
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
  initialTableCheck(id) {
    const element = document.getElementById(id);
    if (element) {
      this.tableOverflown = (element.scrollWidth - element.scrollLeft) > element.clientWidth;
      this.initialized = true;
    }
  }
  back () {
    let langOpts = this.router.url.split("/");
    langOpts.splice(-1, 1);
    return langOpts.join('/');
  }
}
