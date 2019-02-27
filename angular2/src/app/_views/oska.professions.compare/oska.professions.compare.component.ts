import { Component, OnInit, OnDestroy, AfterViewChecked, HostListener } from '@angular/core';
import { RootScopeService } from '@app/_services/rootScopeService';
import { Router, ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { SettingsService } from '@app/_services/settings.service';
import { Subscription } from 'rxjs/Subscription';
import { CompareComponent } from '@app/_components/compare/compare.component';
import { TableService } from '@app/_services/tableService';
import { HttpService } from '@app/_services/httpService';

@Component({
  templateUrl: "oska.professions.compare.template.html",
  styleUrls: ["oska.professions.compare.styles.scss"]
})

export class OskaProfessionsCompareComponent extends CompareComponent implements OnInit, AfterViewChecked, OnDestroy {
  public compare = JSON.parse(sessionStorage.getItem('oskaProfessions.compare')) || [];
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
  public fixedLabelExists: boolean = false;
  public elemAtStart: boolean = true;
  public initialized: boolean = false;
  public oskaFields: any = {};
  public prosFields: any = {};
  public neutralFields: any = {};
  public consFields: any = {};
  public oskaFieldsMaxLength: number = 0;
  public prosFieldsMaxLength: number = 0;
  public neutralFieldsMaxLength: number = 0;
  public consFieldsMaxLength: number = 0;
  public progressFields: Array<any> = [];
  public employedFields: Array<any> = [];
  public employedChangeFields: Array<any> = [];
  public paymentFields: Array<any> = [];
  public graduatesToJobsFields: Array<any> = [];
  public oskaFieldsArr: Array<any> = [];
  public prosFieldsArr: Array<any> = [];
  public neutralFieldsArr: Array<any> = [];
  public consFieldsArr: Array<any> = [];
  public competitionLabel: Array<any> = [];
  public competitionLabels = ['oska.simple', 'oska.quite_simple', 'oska.medium', 'oska.quite_difficult', 'oska.difficult'];
  public trendingValues = [
    {icon: 'trending_flat', class: "top trending-up", text: 'oska.big_increase'},
    {icon: 'trending_up', class: "top", text: 'oska.increase'},
    {icon: 'trending_flat', class: "stagnant", text: 'oska.stagnant'},
    {icon: 'trending_down', class: "bottom", text: 'oska.decline'},
    {icon: 'trending_flat', class: "bottom trending-down", text: 'oska.big_decline'}
  ];
  public graduatesToJobsValues = [
    {icon: 'dot', class: "bottom", text: 'oska.more_graduates'},
    {icon: 'dot', class: "bottom", text: 'oska.less_graduates'},
    {icon: 'dot', class: "top", text: 'oska.enough_graduates'},
    {icon: 'dot', class: "stagnant", text: 'oska.graduates_work_outside_field'},
    {icon: 'dot', class: "low", text: 'oska.no_graduates'}
  ];

  constructor (
    public route: ActivatedRoute, 
    public router: Router,
    private http: HttpService,
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
    this.removeItemFromLocalStorage(id, sessionStorageKey, existing);
    let data = this.list.filter(item => item.nid != id);
    this.formatData(data);
    
    if(!this.list.length) this.rerouteToParent();
  }
  getData(){
    this.loading = true;
    let variables = {
      lang: this.lang.toUpperCase(),
      limit: "3",
      titleEnabled: "false",
      oskaFieldEnabled: "false",
      fixedLabelEnabled: "false",
      offset: "0",
      nid: this.compare,
      nidEnabled: true,
      fetchPolicy: 'no-cache',
      errorPolicy: 'all'
    }
    
    this.http.get('oskaMainProfessionListView', {params:variables}).subscribe(response => {
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
      if(elem.fieldFixedLabel) {
        this.fixedLabelExists = true;
      }
      if(elem.fieldSidebar) {
        elem.fieldSidebar.entity.fieldOskaField.forEach((oska, indexVal) => {
          if (oska.entity) {
            this.oskaFields[index] = this.oskaFields[index] ? [...this.oskaFields[index], oska] : [oska];
            if(this.oskaFieldsMaxLength < indexVal + 1) {this.oskaFieldsMaxLength = indexVal + 1};
          }
        });
      };
      if(elem.reverseOskaMainProfessionOskaIndicatorEntity && elem.reverseOskaMainProfessionOskaIndicatorEntity.entities.length) {
        let claimed = {0: false, 1: false, 2: false, 3: false};
        elem.reverseOskaMainProfessionOskaIndicatorEntity.entities.forEach((term, index) => {
          if (term.oskaId && term.oskaId === 1 && term.value) {
            this.employedFields.push(term.value);
            claimed[term.oskaId - 1] = true;
          }
          if (term.oskaId && term.oskaId === 2 && term.icon) {
            this.employedChangeFields.push(term.icon);
            claimed[term.oskaId - 1] = true;
          }
          if (term.oskaId && term.oskaId === 3) {
            this.paymentFields.push(term.value);
            claimed[term.oskaId - 1] = true;
          }
          if (term.oskaId && term.oskaId === 4) {
            this.graduatesToJobsFields.push(term.icon);
            claimed[term.oskaId - 1] = true;
          }
        });
        if (!claimed[0]) {this.employedFields.push('')}
        if (!claimed[1]) {this.employedChangeFields.push('')}
        if (!claimed[2]) {this.paymentFields.push('')}
        if (!claimed[3]) {this.graduatesToJobsFields.push('')}
      } else {
        this.employedFields.push('')
        this.employedChangeFields.push('')
        this.paymentFields.push('')
        this.graduatesToJobsFields.push('')
      }
      if(elem.reverseOskaMainProfessionOskaFillingBarEntity && elem.reverseOskaMainProfessionOskaFillingBarEntity.entities.length && elem.reverseOskaMainProfessionOskaFillingBarEntity.entities[0].value) {
        this.progressFields.push(elem.reverseOskaMainProfessionOskaFillingBarEntity.entities[0].value);
        if (elem.reverseOskaMainProfessionOskaFillingBarEntity.entities[0].value
          && elem.reverseOskaMainProfessionOskaFillingBarEntity.entities[0].value > 0
          && elem.reverseOskaMainProfessionOskaFillingBarEntity.entities[0].value < 6) {
            this.competitionLabel.push(this.competitionLabels[elem.reverseOskaMainProfessionOskaFillingBarEntity.entities[0].value - 1])
        } else {
          this.competitionLabel.push("");
        }
      } else {
        this.progressFields.push("");
        this.competitionLabel.push("");
      }
      if(elem.fieldSidebar && elem.fieldSidebar.entity.fieldPros && elem.fieldSidebar.entity.fieldPros.length) {
        elem.fieldSidebar.entity.fieldPros.forEach((pro, ind) => {
          this.prosFields[index] = this.prosFields[index] ? [...this.prosFields[index], pro] : [pro];
          if (this.prosFieldsMaxLength < ind + 1) { this.prosFieldsMaxLength = ind + 1; }
        });
      };
      if(elem.fieldSidebar && elem.fieldSidebar.entity.fieldNeutral && elem.fieldSidebar.entity.fieldNeutral.length) {
        elem.fieldSidebar.entity.fieldNeutral.forEach((neutral, ind) => {
          this.neutralFields[index] = this.neutralFields[index] ? [...this.neutralFields[index], neutral] : [neutral];
          if (this.neutralFieldsMaxLength < ind + 1) { this.neutralFieldsMaxLength = ind + 1; }
        });
      };
      if(elem.fieldSidebar && elem.fieldSidebar.entity.fieldCons && elem.fieldSidebar.entity.fieldCons.length) {
        elem.fieldSidebar.entity.fieldCons.forEach((con, ind) => {
          this.consFields[index] = this.consFields[index] ? [...this.consFields[index], con] : [con];
          if (this.consFieldsMaxLength < ind + 1) { this.consFieldsMaxLength = ind + 1; }
        });
      };
    })
    if (this.progressFields.every(this.isEmptyString)) {this.progressFields = [];}
    if (this.employedFields.every(this.isEmptyString)) {this.employedFields = [];}
    if (this.employedChangeFields.every(this.isEmptyString)) {this.employedChangeFields = [];}
    if (this.paymentFields.every(this.isEmptyString)) {this.paymentFields = [];}
    if (this.graduatesToJobsFields.every(this.isEmptyString)) {this.graduatesToJobsFields = [];}
    this.oskaFieldsArr = this.oskaFieldsMaxLength ? Array(this.oskaFieldsMaxLength).fill(0).map((x,i)=>i) : [];
    this.prosFieldsArr = this.prosFieldsMaxLength ? Array(this.prosFieldsMaxLength).fill(0).map((x,i)=>i) : [];
    this.neutralFieldsArr = this.neutralFieldsMaxLength ? Array(this.neutralFieldsMaxLength).fill(0).map((x,i)=>i) : [];
    this.consFieldsArr = this.consFieldsMaxLength ? Array(this.consFieldsMaxLength).fill(0).map((x,i)=>i) : [];
    this.list = data;
  }

  formatNumber (number, locale) {
    let num = parseInt(number, 10)
    let formattedNum = num.toLocaleString(locale)
    return formattedNum.replace(',', ' ')
  }

  isEmptyString(element, index, array) {
    return element === ""
  }

  resetValues() {
    this.oskaFields = {};
    this.prosFields = {};
    this.neutralFields = {};
    this.consFields = {};
    this.oskaFieldsMaxLength = 0;
    this.prosFieldsMaxLength = 0;
    this.neutralFieldsMaxLength = 0;
    this.consFieldsMaxLength = 0;
    this.oskaFieldsArr = [];
    this.prosFieldsArr = [];
    this.neutralFieldsArr = [];
    this.consFieldsArr = [];
    this.progressFields = [];
    this.employedFields = [];
    this.employedChangeFields = [];
    this.paymentFields = [];
    this.graduatesToJobsFields = [];
    this.competitionLabel = [];
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    this.setScrollPos('tableRef');
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
    let langOpts = this.router.url.split("/");
    langOpts.splice(-1, 1);
    return langOpts.join('/');
  }
}
