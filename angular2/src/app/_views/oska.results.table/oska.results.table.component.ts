import { Component, OnInit, HostListener, Input } from '@angular/core';
import { HttpService } from 'app/_services/httpService';
import { TableService, RootScopeService } from '@app/_services';
import { FiltersService } from '@app/_services/filtersService'
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: "oska-results-table-component",
  templateUrl: "oska.results.table.template.html",
  styleUrls: ["oska.results.table.styles.scss"]
})

export class OskaResultsTableComponent extends FiltersService implements OnInit{

  @Input() inputData:any ;
  public tableData: any = false;
  public tableFile: any = false;
  public filteredTableData: any = false;
  public error: boolean = false;
  public tableOverflown: boolean = false;
  public elemAtStart: boolean = true;
  public initialized: boolean = false;
  public modifier: boolean = false;
  public field: string = 'field';
  private scrollPos: string = '0';
  public filterFull: boolean = true;
  public showFilter: boolean = true;
  public searchSubscription: Subscription;
  public params: object;
  public filterOptionsKeys = ['field','responsible','proposalStatus'];
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
    private tableService: TableService,
    private rootScope: RootScopeService,
    public route: ActivatedRoute, 
    public router: Router
  ) {
    super(null, null)
  }

  filterView() {
    if (this.tableData) {
      if (!this.filterFormItems['field'] && !this.filterFormItems['responsible'] && !this.filterFormItems['proposalStatus']) {
        this.filteredTableData = this.tableData;
      }
      this.filterItems = {field: '', responsible: '', proposalStatus: ''};
      Object.keys(this.filterFormItems).forEach((key) => this.filterItems[key] = this.filterFormItems[key] || "");
      this.filteredTableData = this.tableData.filter((elem) => {
        let field = elem.oskaField && elem.oskaField[0] ? elem.oskaField[0].entity.title.toLowerCase() : '';
        let responsible = elem.responsible ? elem.responsible.toLowerCase() : '';
        let proposalStatus = elem.proposalStatus ? elem.proposalStatus.toLowerCase() : '';
        return field.includes(this.filterItems['field'].toLowerCase())
          && responsible.includes(this.filterItems['responsible'].toLowerCase())
          && proposalStatus.includes(this.filterItems['proposalStatus'].toLowerCase());
      })
      this.resetTableScroll();
    }
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
    let variables = {
      "lang": this.rootScope.get('lang').toUpperCase()
    };
    let subscription = this.http.get('oskaResultPageTable', {params:variables}).subscribe( (data) => {
      if ( data['data']['errors'] ) {
         this.error = true;
        return false;
      } else {
        this.tableData = this.filteredTableData = data['data']['oskaTable']['entities'];
        this.tableFile = data['data']['oskaTableFile']['entities'] ? data['data']['oskaTableFile']['entities'][0] : false;
      }
      let fieldsToProcess = ['responsible', 'proposalStatus'];
      if (this.tableData) {
        this.tableData.forEach(elem => {
          if (elem.oskaField && elem.oskaField[0] && !this.filterItemValues['field'].includes(elem.oskaField[0].entity.title)) this.filterItemValues['field'].push(elem.oskaField[0].entity.title);
          return fieldsToProcess.forEach(item => {
            if (elem[item] && !this.filterItemValues[item].includes(elem[item])) this.filterItemValues[item].push(elem[item]);
          });
        });
      }
      subscription.unsubscribe();
      this.filterView();
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
  
  resetTableScroll () {
    let table = document.getElementById('resultsTable');
    if (table) table.scrollLeft = 0;
  }
  
  setScrollPos (id) {
    let table = document.getElementById(id);
    let clientHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    if (table && (table.getBoundingClientRect().top < (clientHeight / 2))) {
      if (!window.pageYOffset) {window.scroll(0, 1)}
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
  @HostListener('document:touchend', ['$event']) touchedOutside($event){
    (document.activeElement as HTMLElement).blur();
  }

  ngOnInit() {
    this.getTableData();
    this.watchSearch();
    this.showFilter = window.innerWidth > 1024;
    this.filterFull = window.innerWidth < 1024;
  }

  watchSearch() {
    this.searchSubscription = this.route.queryParams.subscribe((params: ActivatedRoute) => {
      this.params = params;
      this.filterView();
    });

    this.filterRetrieveParams( this.params );
  }

  ngAfterViewChecked() {
    if(!this.initialized) {
      this.initialTableCheck('resultsTable');
    }
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
  }

}
