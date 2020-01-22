import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '@app/_services';
import { FiltersService } from '@app/_services/filterService';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { Location } from '@angular/common';


@Component({
  selector: 'oskaResultsTable',
  templateUrl: 'oskaResultsView.template.html',
  styleUrls: ['oskaResultsView.styles.scss'],
})

export class OskaResultsView extends FiltersService implements OnInit {

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
  public params: any;

  public path: any = this.location.path();
  public filterOptionsKeys = ['field', 'responsible', 'proposalStatus'];
  public filterItemValues: any = {
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
    public translate: TranslateService,
    public location: Location,
  ) {
    super(null, null);
  }

  filterView() {
    if (this.tableData) {
      if (!this.params.field &&
        !this.params.responsible &&
        !this.params.proposalStatus ) {
        this.filteredTableData = this.tableData;
      }
      let filteredData = this.tableData;
      if (this.params['field']) {
        filteredData = filteredData.filter((el) => {
          return el.oskaField[0].entity.title.toLowerCase() ===
            this.params['field'].toLowerCase();
        });
      }
      if (this.params['responsible']) {
        filteredData = filteredData.filter((el) => {
          return el.responsible.toLowerCase() === this.params['responsible'].toLowerCase();
        });
      }
      if (this.params['proposalStatus']) {
        filteredData = filteredData.filter((el) => {
          return el.proposalStatus.toLowerCase() ===
            this.params['proposalStatus'].toLowerCase();
        });
      }
      this.filteredTableData = filteredData;
    }
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

  removeLimiter(index) {
    const text = document.querySelector(`.elem-${index}`);
    const btn = document.querySelector(`.elem-${index}-btn`);
    text.classList.toggle('less');
    btn.classList.add('hide');
  }

  getTableData() {
    const variables = {
      lang: 'ET',
    };
    const query = this.settingsService.query('oskaResultPageTable', variables);
    const subscription = this.http.get(query).subscribe(
      (data) => {
        if (data['data']['errors']) {
          this.error = true;
          return;
        }
        this.tableData = this.filteredTableData = data['data']['oskaTable']['entities'];
        this.tableFile = data['data']['oskaTableFile']['entities'] ?
          data['data']['oskaTableFile']['entities'][0] : false;
        const fieldsToProcess = ['responsible', 'proposalStatus'];
        if (this.tableData) {
          this.tableData.forEach((elem: any) => {
            if (elem.oskaField && elem.oskaField[0]) {
              this.filterItemValues['field'].push(elem.oskaField[0].entity.title);
            }
            fieldsToProcess.forEach((item: any) => {
              if (elem[item] && !this.filterItemValues[item].includes(elem[item])) {
                this.filterItemValues[item].push(elem[item]);
              }
            });
          });
          this.filterItemValues['field'] = Array.from(new Set(this.filterItemValues.field)).sort();
          this.filterItemValues['responsible'] = this.filterItemValues['responsible'].sort();
          this.filterItemValues['proposalStatus'] = this.filterItemValues['proposalStatus']
            .sort()
            .map((item) => {
              let output = item;
              if (typeof item === 'string') {
                output = {
                  key: item,
                  value: item,
                };
              }

              return output;
            });

          for (const key in this.filterItemValues) {
            this.filterItemValues[key].unshift({ key: 'Kõik', value: '' });
          }
          this.cdr.detectChanges();
        }
        this.filterView();
        subscription.unsubscribe();
      },
      (err) => {
        console.log(err);
        this.error = true;
      });
  }

  setAlert(sortedBy) {
    // this doesnt do anything in live?
    // if (sortedBy) {
    //   let modifierValue = this.modifier ? 'sort.descending' : 'sort.ascending';
    //   let sortLabel = `${this.translate.get(sortedBy)['value']} - ${this.translate.get(modifierValue)['value']}`;
    //   this.alertText = `${this.translate.get('button.sorted_by')['value']} ${sortLabel}`;
    // } else {
    //   let commentValue = this.commentVisible ? 'button.column_opened' : 'button.column_closed';
    //   this.alertText = `${this.translate.get('oska.table_experts_comment')['value']} ${this.translate.get(commentValue)['value']}`;
    // }
  }

  toggleFilters(): void {
    setTimeout(
      () => {
        let activatedFilters = false;
        const filters = Object.keys(this.route.snapshot.queryParams).filter((item) => {
          if (item !== 'field' && item !== 'responsible') {
            return item;
          }
        });
        if (filters.length > 0) {
          activatedFilters = true;
        }

        this.showFilter = window.innerWidth > 1024;
        let fullFilters = window.innerWidth < 1024;
        if (!fullFilters && activatedFilters) {
          fullFilters = true;
        }
        this.filterFull = fullFilters;
      },
      0);
  }

  ngOnInit() {
    this.toggleFilters();
    this.getTableData();
    this.watchSearch();
  }

  watchSearch() {
    this.searchSubscription = this.route.queryParams.subscribe((params: ActivatedRoute) => {
      this.params = params;
      this.filterView();
      this.cdr.detectChanges();
    });

    this.filterRetrieveParams(this.params);
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
  }

}
