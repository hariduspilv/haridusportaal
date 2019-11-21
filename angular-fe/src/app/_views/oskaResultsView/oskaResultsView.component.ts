import { Component, OnInit, HostListener, Input, ChangeDetectorRef } from '@angular/core';
// import { TableService, RootScopeService } from '@app/_services';
// import { FiltersService } from '@app/_services/filtersService'
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '@app/_services';
// import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'oskaResultsTable',
  templateUrl: 'oskaResultsView.template.html',
  styleUrls: ['oskaResultsView.styles.scss'],
})

export class OskaResultsView implements OnInit {

  @Input() inputData: any;
  public tableData: any = false;
  public tableFile: any = false;
  public filteredTableData: any = false;
  public error: boolean = false;
  public updated: boolean = false;
  public recentCommentState: boolean = false;
  public commentVisible: boolean = false;
  public tableOverflown: boolean = false;
  public elemAtStart: boolean = true;
  public initialized: boolean = false;
  public modifier: boolean = false;
  public field: string = 'field';
  private scrollPos: string = '0';
  public filterFull: boolean = true;
  public showFilter: boolean = true;
  public searchSubscription: Subscription;
  private activeSortedBy: string = '';
  private alertText: string = '';
  public params: object;
  public filterOptionsKeys = ['field', 'responsible', 'proposalStatus'];
  public filterItems: {} = {
    field: '',
    responsible: '',
    proposalStatus: '',
  };
  public filterItemValues: {} = {
    field: [],
    responsible: [],
    proposalStatus: [],
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    // private tableService: TableService,
    // private rootScope: RootScopeService,
    public route: ActivatedRoute,
    public settingsService: SettingsService,
    public router: Router,
    // public translate: TranslateService
  ) {
  }

  filterView() {
    // if (this.tableData) {
    //   if (!this.filterFormItems['field'] && !this.filterFormItems['responsible'] && !this.filterFormItems['proposalStatus']) {
    //     this.filteredTableData = this.tableData;
    //   }
    //   if (this.params['field'] && !this.filterItemValues['field'].includes(this.params['field'])) {
    //     this.router.navigate([], { queryParams: { field: null }, queryParamsHandling: 'merge', replaceUrl: true });
    //     this.filterFormItems['field'] = '';
    //   }
    //   this.filterItems = { field: '', responsible: '', proposalStatus: '' };
    //   Object.keys(this.filterFormItems).forEach((key) => this.filterItems[key] = this.filterFormItems[key] || "");
    //   this.filteredTableData = this.tableData.filter((elem) => {
    //     let field = elem.oskaField && elem.oskaField[0] ? elem.oskaField[0].entity.title.toLowerCase() : '';
    //     let responsible = elem.responsible ? elem.responsible.toLowerCase() : '';
    //     let proposalStatus = elem.proposalStatus ? elem.proposalStatus.toLowerCase() : '';
    //     return field.includes(this.filterItems['field'].toLowerCase())
    //       && responsible.includes(this.filterItems['responsible'].toLowerCase())
    //       && proposalStatus.includes(this.filterItems['proposalStatus'].toLowerCase());
    //   })
    //   this.removeAllRedundantClasses()
    //   this.updated = true;
    //   this.resetTableScroll();
    // }
  }

  sortView(field) {
    this.modifier = !this.modifier;
    this.field = field;
    if (field === 'field') {
      this.filteredTableData = this.filteredTableData.sort((a, b) => {
        const aField = a['oskaField'] && a['oskaField'][0] ? a['oskaField'][0]['entity']['title'].toLowerCase() : '';
        const bField = b['oskaField'] && b['oskaField'][0] ? b['oskaField'][0]['entity']['title'].toLowerCase() : '';
        if (aField < bField) { return this.modifier ? -1 : 1; }
        if (aField > bField) { return this.modifier ? 1 : -1; }
        return 0;
      })
    } else {
      this.filteredTableData = this.filteredTableData.sort((a, b) => {
        const aField = a[field] ? a[field].toLowerCase() : '';
        const bField = b[field] ? b[field].toLowerCase() : '';
        if (aField < bField) { return this.modifier ? -1 : 1; }
        if (aField > bField) { return this.modifier ? 1 : -1; }
        return 0;
      })
    }
  }

  limitTableRows(id, maxChars) {
    const limitedDivs = document.querySelectorAll(id);
    for (let i = 0; i < limitedDivs.length; i += 1) {
      if (limitedDivs[i].innerHTML.length >= 150) {
        limitedDivs[i].classList.add('less');
        limitedDivs[i].classList.add(`elem-${i}`);
        limitedDivs[i].nextElementSibling.classList.remove('hidden');
        limitedDivs[i].nextElementSibling.childNodes[0].classList.add(i);
      }
    }
  }

  removeAllRedundantClasses() {
    const elems = document.querySelectorAll('[class*="elem-"]');
    for (let i = 0; i < elems.length; i++) {
      Array.from(elems[i].classList).forEach((className: any) => {
        if (className.startsWith('elem')) {
          elems[i].classList.remove(className);
        }
      });
    }
  }

  removeLimiter(self) {
    self.target.parentNode.classList.add('hidden');
    const sibling = document.querySelector(`.elem-${self.target.className}`);
    sibling.classList.remove('less');
    sibling.classList.remove(`elem-${self.target.className}`);
    self.target.parentNode.childNodes[0].classList.remove(`${self.target.className}`);
  }

  getTableData() {
    const variables = {
      lang: 'ET',
    };
    const query = this.settingsService.query('oskaResultPageTable', variables);
    const subscription = this.http.get(query).subscribe((data) => {
      console.log(data);
      if (data['data']['errors']) {
        this.error = true;
        return;
      }
      this.tableData = this.filteredTableData = data['data']['oskaTable']['entities'];
      this.tableFile = data['data']['oskaTableFile']['entities'] ? data['data']['oskaTableFile']['entities'][0] : false;
      const fieldsToProcess = ['responsible', 'proposalStatus'];
      if (this.tableData) {
        this.tableData.forEach(elem => {
          if (elem.oskaField && elem.oskaField[0] && !this.filterItemValues['field'].includes(elem.oskaField[0].entity.title)) {
            this.filterItemValues['field'].push(elem.oskaField[0].entity.title);
          }
          fieldsToProcess.forEach(item => {
            if (elem[item] && !this.filterItemValues[item].includes(elem[item])) this.filterItemValues[item].push(elem[item]);
          });
        });
        this.filterItemValues['proposalStatus'].sort();
        this.filterItemValues['field'].sort();
        this.filterItemValues['responsible'].sort();
      }
      this.filterView();
      subscription.unsubscribe();
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
      this.limitTableRows('#limitedData', 150);
    }
  }

  resetTableScroll() {
    let table = document.getElementById('resultsTable');
    if (table) table.scrollLeft = 0;
  }

  setAlert(sortedBy) {
    // if (sortedBy) {
    //   let modifierValue = this.modifier ? 'sort.descending' : 'sort.ascending';
    //   let sortLabel = `${this.translate.get(sortedBy)['value']} - ${this.translate.get(modifierValue)['value']}`;
    //   this.alertText = `${this.translate.get('button.sorted_by')['value']} ${sortLabel}`;
    // } else {
    //   let commentValue = this.commentVisible ? 'button.column_opened' : 'button.column_closed';
    //   this.alertText = `${this.translate.get('oska.table_experts_comment')['value']} ${this.translate.get(commentValue)['value']}`;
    // }
  }

  setScrollPos(id) {
    let table = document.getElementById(id);
    let clientHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    if (table && (table.getBoundingClientRect().top < (clientHeight / 2))) {
      if (!window.pageYOffset) { window.scroll(0, 1) }
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
  @HostListener('document:touchend', ['$event']) touchedOutside($event) {
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

    // this.filterRetrieveParams(this.params);
  }

  evaluateChange(id) {
    const element = document.getElementById(id);
    if (element) {
      this.tableOverflown = (element.scrollWidth - element.scrollLeft) > element.clientWidth;
      this.setScrollPos(id);
      if (window.innerWidth > 1024) {
        element.scrollLeft = 999;
      } else if (!this.commentVisible && !this.elemAtStart) {
        this.tableOverflown = false;
      }
      this.cdr.detectChanges();
    }
  }

  ngAfterViewChecked() {
    if (!this.initialized) {
      this.initialTableCheck('resultsTable');
    }
    if (this.updated) {
      this.limitTableRows('#limitedData', 150);
      this.evaluateChange('resultsTable');
      this.updated = false;
    }
    if (this.recentCommentState !== this.commentVisible) {
      this.evaluateChange('resultsTable');
      this.recentCommentState = this.commentVisible;
    }
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
  }

}
