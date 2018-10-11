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
  templateUrl: "oska.professions.compare.template.html",
  styleUrls: ["oska.professions.compare.styles.scss"]
})

export class OskaProfessionsCompareComponent extends CompareComponent implements OnInit, AfterViewChecked, OnDestroy {
  public compare = JSON.parse(localStorage.getItem('oskaProfessions.compare')) || [];
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
        this.lang = params['lang'];
      }
    );

    this.subscriptions = [...this.subscriptions, subscribe];
  }
  setPaths() {
    this.rootScope.set('langOptions', {
      'en': '/en/professions/compare',
      'et': '/et/pohikutsealad/vordlus'
    });
  }
  rerouteToParent(): void {
    let currentUrl = JSON.parse(JSON.stringify(this.path.split('/')));
    currentUrl.pop();
    
    let parentUrl = currentUrl.join('/');
    this.router.navigateByUrl(parentUrl);
  }
  removeItemFromList(id, localStorageKey){
    let existing = this.readFromLocalStorage(localStorageKey);
    this.removeItemFromLocalStorage(id, localStorageKey, existing)
    this.list = this.list.filter(item => item.Nid != id);
    
    if(!this.list.length) this.rerouteToParent();
  }
  getData(){
    let variables = {
      lang: this.lang,
      title: "",
      limit: 3,
      fixed_label: "1",
      status: "1",
      nid: this.compare
    }

    this.url = this.settings.url + "/graphql?queryId=oskaMainProfessionListView:1&variables=" + JSON.stringify(variables);
    
    this.http.get(this.url).subscribe(response => {
      this.list = response['data']['CustomElasticQuery'];
      if(!this.list.length) {
        this.rerouteToParent();
      }
    }, (err) => {
      console.log(err);
    });
  }
 
  ngOnInit() {
    
    this.pathWatcher();
    this.setPaths();
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
    let langOpts = this.rootScope.get('langOptions')[this.lang].split('/')
    langOpts.splice(-1, 1)
    return langOpts.join('/')
  }
}
