import { Component, OnInit, OnDestroy, AfterViewChecked, HostListener } from '@angular/core';
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
  private deleteText: string = '';
  private deleteIndicator: number = 1;
  private scrollPos: string = '0';
  public list: any = false;
  public loading: boolean = false;
  private subscriptions: Subscription[] = [];
  public tableOverflown: boolean = false;
  public elemAtStart: boolean = true;
  public initialized: boolean = false;
  public oskaFields: any = {};
  public termFields: any = {};
  public prosFields: any = {};
  public consFields: any = {};
  public oskaFieldsMaxLength: number = 0;
  public termFieldsMaxLength: number = 0;
  public prosFieldsMaxLength: number = 0;
  public consFieldsMaxLength: number = 0;
  public oskaFieldsArr: Array<any> = [];
  public termFieldsArr: Array<any> = [];
  public prosFieldsArr: Array<any> = [];
  public consFieldsArr: Array<any> = [];

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
      'et': '/et/ametialad/vordlus'
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
    this.removeItemFromLocalStorage(id, localStorageKey, existing);
    let data = this.list.filter(item => item.nid != id);
    this.formatData(data);
    
    if(!this.list.length) this.rerouteToParent();
  }
  getData(){
    this.loading = true;
    let variables = {
      lang: this.lang.toUpperCase(),
      limit: 3,
      titleEnabled: false,
      oskaFieldEnabled: false,
      fixedLabelEnabled: false,
      offset: 0,
      nid: this.compare,
      nidEnabled: true,
      fetchPolicy: 'no-cache',
      errorPolicy: 'all'
    }
    this.url = this.settings.url + "/graphql?queryName=oskaMainProfessionListView&queryId=27dcbc2fc3ff7c8161a8783bb1235018470b42f4:1&variables=" + JSON.stringify(variables);
    
    this.http.get(this.url).subscribe(response => {
      let data = response['data']['nodeQuery']['entities'];
      this.formatData(data);
      this.loading = false;
      if(!this.list.length) {
        this.rerouteToParent();
      } else {
        this.setScrollPos('tableRef');
      }
    }, (err) => {
      console.log(err);
      this.loading = false;
    });
  }

  formatData(data) {
    this.resetValues();
    data.forEach((elem, index) => {
      if(elem.fieldSidebar) {
        elem.fieldSidebar.entity.fieldOskaField.forEach((oska, indexVal) => {
          this.oskaFields[index] = this.oskaFields[index] ? [...this.oskaFields[index], oska] : [oska];
          if(this.oskaFieldsMaxLength < indexVal) {this.oskaFieldsMaxLength = indexVal};
        });
      };
      if(elem.reverseOskaMainProfessionOskaIndicatorEntity && elem.reverseOskaMainProfessionOskaIndicatorEntity.entities.length) {
        elem.reverseOskaMainProfessionOskaIndicatorEntity.entities.forEach((term, indexVal2) => {
          this.termFields[index] = this.termFields[index] ? [...this.termFields[index], term] : [term];
          if(this.termFieldsMaxLength < indexVal2) {this.termFieldsMaxLength = indexVal2};
        });
      };
      if(elem.fieldSidebar && elem.fieldSidebar.entity.fieldPros && elem.fieldSidebar.entity.fieldPros.length) {
        elem.fieldSidebar.entity.fieldPros.forEach((pro, indexVal3) => {
          this.prosFields[index] = this.prosFields[index] ? [...this.prosFields[index], pro] : [pro];
          this.prosFieldsMaxLength = indexVal3 + 1;
        });
      };
      if(elem.fieldSidebar && elem.fieldSidebar.entity.fieldCons && elem.fieldSidebar.entity.fieldCons.length) {
        elem.fieldSidebar.entity.fieldCons.forEach((con, indexVal4) => {
          this.consFields[index] = this.consFields[index] ? [...this.consFields[index], con] : [con];
          this.consFieldsMaxLength = indexVal4 + 1;
        });
      };
    })
    this.oskaFieldsArr = this.oskaFieldsMaxLength ? Array(this.oskaFieldsMaxLength+1).fill(0).map((x,i)=>i) : [];
    this.termFieldsArr = this.termFieldsMaxLength ? Array(this.termFieldsMaxLength+1).fill(0).map((x,i)=>i) : [];
    this.prosFieldsArr = this.prosFieldsMaxLength ? Array(this.prosFieldsMaxLength).fill(0).map((x,i)=>i) : [];
    this.consFieldsArr = this.consFieldsMaxLength ? Array(this.consFieldsMaxLength).fill(0).map((x,i)=>i) : [];
    this.list = data;
  }

  resetValues() {
    this.oskaFields = {};
    this.termFields = {};
    this.prosFields = {};
    this.consFields = {};
    this.oskaFieldsMaxLength = 0;
    this.termFieldsMaxLength = 0;
    this.prosFieldsMaxLength = 0;
    this.consFieldsMaxLength = 0;
    this.oskaFieldsArr = [];
    this.termFieldsArr = [];
    this.prosFieldsArr = [];
    this.consFieldsArr = [];
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    this.setScrollPos('tableRef');
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
  setScrollPos (id) {
    let table = document.getElementById(id);
    let clientHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    if (table.getBoundingClientRect().top < (clientHeight / 2)) {
      this.scrollPos = ((clientHeight / 2) - table.getBoundingClientRect().top).toString();
    }
    if (parseInt(this.scrollPos, 10) <= table.getBoundingClientRect().height) {
      if (document.getElementById('scrollableRight')) {
        document.getElementById('scrollableRight').setAttribute('style', "top: " + this.scrollPos + "px");
      }
      if (document.getElementById('scrollableLeft')) {
        document.getElementById('scrollableLeft').setAttribute('style', "top: " + this.scrollPos + "px");
      }
    }
  }
  initialTableCheck(id) {
    const element = document.getElementById(id);
    if (element) {
      this.tableOverflown = (element.scrollWidth - element.scrollLeft) > element.clientWidth;
      this.setScrollPos('tableRef')
      this.initialized = true;
    }
  }
  setDeleteText() {
    this.deleteText = this.deleteIndicator.toString();
    this.deleteIndicator++;
  }
  back () {
    let langOpts = this.rootScope.get('langOptions')[this.lang].split('/')
    langOpts.splice(-1, 1)
    return langOpts.join('/')
  }
}
