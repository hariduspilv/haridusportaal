import { Component, OnInit, HostListener } from '@angular/core';
import { HttpService } from 'app/_services/httpService';
import { ActivatedRoute, Router } from '@angular/router';
import { RootScopeService } from 'app/_services/rootScopeService';
import { UserService } from '@app/_services/userService';
import { TableService } from '@app/_services';

@Component({
  templateUrl: "oska.results.template.html",
  styleUrls: ["oska.results.styles.scss"]
})

export class OskaResultsComponent implements OnInit{

  public data: any = false;
  public tableData: any = false;
  public filteredTableData: any = false;
  public video: any = false;
  public error: boolean = false;
  public viewType : string = 'results'
  public sidebarData: any = false;
  public userLoggedOut: boolean = false;
  public tableOverflown: boolean = false;
  public elemAtStart: boolean = true;
  public initialized: boolean = false;
  public modifier: boolean = false;
  public field: string = 'field';
  private scrollPos: string = '0';
  public filterItems: {} = {
    field: '',
    responsible: '',
    proposalStatus: ''
  }
  public filterItemValues: {} = {
    field: [],
    responsible: [],
    proposalStatus: []
  }

  constructor(
    private http: HttpService,
    private route: ActivatedRoute,
    private router: Router,
    private rootScope: RootScopeService,
    private user: UserService,
    private tableService: TableService
  ) {}

  setLangLinks(data){
    const langOptions = data['data']['route']['languageSwitchLinks'];
    let langValues = {};
    for( var i in langOptions ){
      langValues[langOptions[i].language.id] = langOptions[i].url.path;
    }
    this.rootScope.set('langOptions', langValues);
  }

  getData(){
    let url = "/graphql?queryId=oskaResultPageDetailView:1&variables=";
    let variables = {
      "lang": this.rootScope.get('currentLang'),
      "path": this.router.url
    };
    url+= JSON.stringify(variables);
    let subscription = this.http.get(url).subscribe( (data) => {
      if ( data['errors'] ) {
        this.error = true;
        return false;
      } else if ( data['data']['route'] == null ) {
        this.error = true;
        return false;
      } else {
        this.data = data['data']['route']['entity'];
      }
      if (this.data.fieldResultPageSidebar) {
        this.sidebarData = this.data.fieldResultPageSidebar.entity;
      }
      this.setLangLinks(data);

      subscription.unsubscribe();
    }, (err) => {
      console.log(err);
      this.error = true;
    });
  }
  
  filterView() {
    if (!this.filterItems['field'] && !this.filterItems['responsible'] && !this.filterItems['proposalStatus']) {
      this.filteredTableData = this.tableData;
    }
    Object.keys(this.filterItems).forEach((key) => this.filterItems[key] = this.filterItems[key] || "");
    this.filteredTableData = this.tableData.filter((elem) => {
      let field = elem.oskaField && elem.oskaField[0] ? elem.oskaField[0].entity.title.toLowerCase() : '';
      let responsible = elem.responsible ? elem.responsible.toLowerCase() : '';
      let proposalStatus = elem.proposalStatus ? elem.proposalStatus.toLowerCase() : '';
      return field.includes(this.filterItems['field'].toLowerCase())
        && responsible.includes(this.filterItems['responsible'].toLowerCase())
        && proposalStatus.includes(this.filterItems['proposalStatus'].toLowerCase());
    })
  }

  sortView(field) {
    this.modifier = !this.modifier;
    this.field = field;
    if (field === 'field') {
      this.filteredTableData = this.filteredTableData.sort((a, b) => {
        let aField = a['oskaField'] && a['oskaField'][0] ? a['oskaField'][0]['entity']['title'].toLowerCase() : '';
        let bField = b['oskaField'] && b['oskaField'][0] ? b['oskaField'][0]['entity']['title'].toLowerCase() : '';
        if(aField < bField) { return this.modifier ? -1 : 1; }
        if(aField > bField) { return this.modifier ? 1 : -1; }
        return 0;
      })
    } else {
      this.filteredTableData = this.filteredTableData.sort((a, b) => {
        let aField = a[field] ? a[field].toLowerCase() : '';
        let bField = b[field] ? b[field].toLowerCase() : '';
        if(aField < bField) { return this.modifier ? -1 : 1; }
        if(aField > bField) { return this.modifier ? 1 : -1; }
        return 0;
      })
    }
  }

  getTableData(){
    let url = "/graphql?queryId=oskaResultPageTable:1";
    let subscription = this.http.get(url).subscribe( (data) => {
      if ( data['data']['errors'] ) {
        this.error = true;
        return false;
      } else {
        this.tableData = this.filteredTableData = data['data']['oskaTableEntityQuery']['entities'];
      }
      let fieldsToProcess = ['responsible', 'proposalStatus'];
      if (this.tableData) {
        this.tableData.forEach(elem => {
          if (elem.oskaField && elem.oskaField[0]) this.filterItemValues['field'].push(elem.oskaField[0].entity.title);
          return fieldsToProcess.forEach(item => {
            if (elem[item]) this.filterItemValues[item].push(elem[item]);
          });
        });
      }
      subscription.unsubscribe();
      this.setScrollPos('resultsTable');
    }, (err) => {
      console.log(err);
      this.error = true;
    });
  }

  initialTableCheck(id) {
    const element = document.getElementById(id);
    if (element) {
      this.tableOverflown = (element.scrollWidth - element.scrollLeft) > element.clientWidth;
      this.setScrollPos('resultsTable');
      this.initialized = true;
    }
  }
  
  setScrollPos (id) {
    let table = document.getElementById(id);
    let clientHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    if (table && (table.getBoundingClientRect().top < (clientHeight / 2))) {
      this.scrollPos = ((clientHeight / 2) - table.getBoundingClientRect().top).toString();
    }
    if (table && (parseInt(this.scrollPos, 10) <= table.getBoundingClientRect().height)) {
      if (document.getElementById('scrollableRight')) {
        document.getElementById('scrollableRight').setAttribute('style', 'top: ' + this.scrollPos + 'px');
      }
      if (document.getElementById('scrollableLeft')) {
        document.getElementById('scrollableLeft').setAttribute('style', 'top: ' + this.scrollPos + 'px');
      }
    }
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    this.setScrollPos('resultsTable');
  }

  ngOnInit() {
    this.getData();
    this.getTableData();
    this.route.params.subscribe( params => {
      this.userLoggedOut = this.user.getData()['isExpired'];
    });
  }

  ngAfterViewChecked() {
    if(!this.initialized) {
      this.initialTableCheck('resultsTable');
    }
  }
}
