import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpService } from 'app/_services/httpService';
import { FiltersService } from '@app/_services/filtersService';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { RootScopeService } from '@app/_services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: "oska.professions.template.html",
  styleUrls: ["oska.professions.styles.scss"]
})

export class OskaProfessionsComponent extends FiltersService implements OnInit, OnDestroy {

  public data: any = false;
  public loading: boolean = false;
  public errMessage: any = false;
  private params: object;
  public lang: string;
  public limit: number = 999;
  public listLimit: number = 5;
  public step: number = 5;
  public listEnd: boolean;
  public showFilter: boolean = true;
  public filterFull: boolean = true;
  public oskaFieldValue: any;
  public sortedBy: any = [];
  private FilterOptions: object = {};
  private filterOptionKeys = ['oskaFieldValue', 'sortedBy', 'fixedLabelValue'];
  public competitionLabels = ['oska.simple_extended', 'oska.quite_simple_extended', 'oska.medium_extended', 'oska.quite_difficult_extended', 'oska.difficult_extended'];
  private paramsSub: Subscription;
  private dataSub: Subscription;
  private filterSub: Subscription;

  constructor(
    private http: HttpService,
    public router: Router,
    public route: ActivatedRoute,
    public rootScope: RootScopeService,
    public translate: TranslateService
  ) {
    super(null, null);
  }


  populateFilterOptions(){
    let variables = {
      lang: this.lang.toUpperCase(),
      limit: this.limit
    };
    this.filterSub = this.http.get('oskaMainProfessionListViewFilter', {params:variables}).subscribe(response => {
      this.oskaFieldValue = response['data']['oskaFields']['entities'];

      // Map unique indicators for ascending and descending cases
      let oskaIndicators = response['data']['oskaIndicators']['entities'];
      let ascendingLabel = this.translate.get('oska.ascending')['value'];
      let descendingLabel = this.translate.get('oska.descending')['value'];
      let oskaIndicatorUniqueValues = Array.from(new Set(oskaIndicators.map(item => item.oskaIndicator)));
      oskaIndicatorUniqueValues.forEach((elem, index) => {
        this.sortedBy = [
          ...this.sortedBy, 
          { name: elem + " - " + ascendingLabel, indicator: elem, id: elem + "-asc", modifier: 'ascending' }, 
          { name: elem + " - " + descendingLabel, indicator: elem, id: elem + "-desc", modifier: 'descending' }
        ];
      });

      for(let i in this.filterOptionKeys){
        if( this.params[this.filterOptionKeys[i]] !== undefined && (this.filterOptionKeys[i] === 'fixedLabelValue' || this.filterOptionKeys[i] === 'sortedBy')) {
          this.filterFormItems[this.filterOptionKeys[i]] = this.params[this.filterOptionKeys[i]];
        } else if (this.params[this.filterOptionKeys[i]] !== undefined) {
          this.filterFormItems[this.filterOptionKeys[i]] = parseInt(this.params[this.filterOptionKeys[i]], 10);
        }
        if( this[this.filterOptionKeys[i]] ) {
          this.FilterOptions[this.filterOptionKeys[i]] = this[this.filterOptionKeys[i]];
        }
      }
      this.filterSub.unsubscribe();
    }, (err) => {})
  };

  loadMore(){
    this.listLimit += this.step;
    if( this.data.length <= this.listLimit ){ 
      this.listEnd = true;
    } else this.listEnd = false;
    let focusTarget = (this.listLimit - this.step - 1).toString();
    document.getElementById(focusTarget).focus();
  }

  reset() {
    this.limit = 999;
    this.listLimit = 5;
    this.listEnd = false;
    this.data = false;
    this.getData(this.params);
  }

  getData (params) {
    this.loading = true;
    this.errMessage = false;
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
    this.filterFormItems = !Object.keys(this.params).length ? {} : this.filterFormItems;
    this.data = false;
    
    let variables = {
      lang: this.lang.toUpperCase(),
      titleValue: this.params['titleValue'] ? "%" + this.params['titleValue'] + "%" : "",
      titleEnabled: this.params['titleValue'] ? true : false,
      oskaFieldValue: this.params['oskaFieldValue'] ? this.params['oskaFieldValue'] : "",
      oskaFieldEnabled: this.params['oskaFieldValue'] ? true : false,
      fixedLabelValue: this.params['fixedLabelValue'] ? '1' : '0',
      fixedLabelEnabled: this.params['fixedLabelValue'] ? true : false,
      sortedBy: false,
      nidEnabled: false,
      offset: 0,
      limit: this.limit
    };
    this.dataSub = this.http.get('oskaMainProfessionListView', {params:variables}).subscribe(response => {
      let responseVal: any = response['data']['nodeQuery']['entities'];
      let filterIndicator: any = false;
      let responseData: any = false;
      this.loading = false;
      if (response['errors']) {
        this.loading = false;
        this.data = [];
        this.errMessage = response['errors'][0]['message'];
      }
      
      // Sort by filter if it exists
      if (this.params['sortedBy'] && this.FilterOptions['sortedBy']) {
        filterIndicator = this.FilterOptions['sortedBy'].filter(elem => elem.id === this.params['sortedBy'])[0];
      }
      if (filterIndicator && responseVal.length) {
        responseData = responseVal.filter((elem) => {
          return elem.reverseOskaMainProfessionOskaIndicatorEntity.entities.filter(indicator => indicator.oskaIndicator === filterIndicator.indicator).length > 0;
        }).sort((a, b) => {
          let indicatorA = a.reverseOskaMainProfessionOskaIndicatorEntity.entities.filter(indicator => indicator.oskaIndicator === filterIndicator.indicator)[0];
          let indicatorB = b.reverseOskaMainProfessionOskaIndicatorEntity.entities.filter(indicator => indicator.oskaIndicator === filterIndicator.indicator)[0];
          return filterIndicator.modifier === 'ascending' ? indicatorA.value - indicatorB.value : indicatorB.value - indicatorA.value;
        });
      } else {
        responseData = responseVal;
      }
      this.data = responseData;

      if( responseData.length <= this.listLimit ){ 
        this.listEnd = true;
      } else this.listEnd = false;
      this.dataSub.unsubscribe();
      if (window.innerWidth <= 1024) {
        let elem = document.getElementById('searchHead');
        elem.scrollIntoView({behavior: "smooth", block: "start"});
      }
    }, (err) => {
      this.data = [];
      this.loading = false;
    })
  }

  watchParams () {
    this.paramsSub = this.route.queryParams.subscribe((params: ActivatedRoute) => {
      this.params = params;
      this.reset();
    });
    this.filterRetrieveParams( this.params );
  }

  ngOnInit () {
    this.showFilter = window.innerWidth > 1024;
    this.filterFull = window.innerWidth <= 1024;

    this.lang = this.rootScope.get("lang");

    this.watchParams();
    this.populateFilterOptions();
    this.filterSubmit();
    if (window.innerWidth > 1024) {
      this.filterFull = this.params['fixedLabelValue'] || this.params['sortedBy'];
    }
  }
  
  ngOnDestroy () {
    this.paramsSub.unsubscribe();
  }
}
