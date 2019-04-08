import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { HttpService } from 'app/_services/httpService';
import { FiltersService } from '@app/_services/filtersService';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { RootScopeService } from '@app/_services';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators/delay';
import { MatAutocomplete } from '@angular/material';

@Component({
  templateUrl: "oska.professions.template.html",
  styleUrls: ["oska.professions.styles.scss"]
})

export class OskaProfessionsComponent extends FiltersService implements OnInit, OnDestroy {

  public data: any = false;
  public loading: boolean = false;
  public errMessage: any = false;
  private params: any;
  public lang: string;
  public limit: number = 999;
  public listLimit: number = 5;
  public step: number = 5;
  public listEnd: boolean;
  public showFilter: boolean = true;
  public filterFull: boolean = true;
  public oskaFieldValue: any = [];
  public sortedBy: any = [];
  private FilterOptions: any = {};
  private filterOptionKeys = ['oskaFieldValue', 'sortedBy', 'fixedLabelValue', 'oskaFixedLabels', 'fillingBarValues'];
  public competitionLabels = ['oska.simple_extended', 'oska.quite_simple_extended', 'oska.medium_extended', 'oska.quite_difficult_extended', 'oska.difficult_extended'];
  private paramsSub: Subscription;
  private dataSub: Subscription;
  private filterSub: Subscription;
  private oskaFixedLabels: any = [];
  private oskaFixedLabelsObs: any = [];
  private fillingBarValues = [1, 2, 3, 4, 5];

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
    this.filterSub = this.http.get('oskaMainProfessionListViewFilter', {params:variables}).subscribe((response: any) => {
      this.oskaFieldValue = response.data.oskaFields.entities;
      // Map unique indicators for ascending and descending cases
      let oskaIndicators = response.data.oskaIndicators.entities;
      let ascendingLabel = this.translate.get('oska.ascending')['value'];
      let descendingLabel = this.translate.get('oska.descending')['value'];
      let oskaIndicatorUniqueValues = Array.from(new Set(oskaIndicators.map(item => item.oskaIndicator)));
      this.oskaFixedLabels = response.data.oskaFixedLabels.entities;
      this.oskaFixedLabelsObs = of(this.oskaFixedLabels);
      oskaIndicatorUniqueValues.forEach((elem, index) => {
        this.sortedBy = [
          ...this.sortedBy, 
          { name: elem + " - " + ascendingLabel, indicator: elem, id: elem + "-asc", modifier: 'ascending' }, 
          { name: elem + " - " + descendingLabel, indicator: elem, id: elem + "-desc", modifier: 'descending' }
        ];
      });
      for(let i in this.filterOptionKeys){
        if( this[this.filterOptionKeys[i]] ) {
          this.FilterOptions[this.filterOptionKeys[i]] = this[this.filterOptionKeys[i]];
        }
        if(this.params[this.filterOptionKeys[i]] !== undefined) {
          switch (this.filterOptionKeys[i]) {
            case 'fillingBarValues':
              this.filterFormItems.fillingBarValues = this.params.fillingBarValues.split(',').map((s:any) => parseInt(s, 10));
              this.fillingBarValuesSort(false);              
              break;
            case 'oskaFieldValue':
              this.filterFormItems.oskaFieldValue = this.params.oskaFieldValue.split(',').map((s:any) => parseInt(s, 10));
              this.oskaFieldValueSort(false);
              break;
            case 'oskaFixedLabels':
              this.filterFormItems.oskaFixedLabels = this.params.oskaFixedLabels.split(',');
              this.oskaFixedLabelsSort();
              break;
            default:
              this.filterFormItems[this.filterOptionKeys[i]] = this.params[this.filterOptionKeys[i]];
              break;
          }
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

  fillingBarValuesSort(e) {
    if(!e && this.filterFormItems.fillingBarValues) {
      const sortedSelected = this.filterFormItems.fillingBarValues.sort((a, b) => {
        if(a < b) {
          return -1;
        }
        return 1;
      });
      const otherValues = this.FilterOptions.fillingBarValues.filter(el => !sortedSelected.find(value => value === el));
      this.FilterOptions.fillingBarValues= [...sortedSelected, ...otherValues];
    }
  }

  oskaFieldValueSort(e) {
    if(!e && this.filterFormItems.oskaFieldValue) {
      const sortedSelected = this.FilterOptions.oskaFieldValue.filter(el => this.filterFormItems.oskaFieldValue.find(value => value === el.nid)).sort((a, b) => {
        if(a.title.toUpperCase() < b.title.toUpperCase()) {
          return -1;
        }
        return 1;
      });
      const otherValues = this.FilterOptions.oskaFieldValue.filter(el => !sortedSelected.find(value => value.nid === el.nid));
      this.FilterOptions.oskaFieldValue = [...sortedSelected, ...otherValues];
    }
  }

  oskaFixedLabelsSort() {
    if(this.filterFormItems.oskaFixedLabels) {
          const sortedSelected = this.FilterOptions.oskaFixedLabels.filter(el => this.filterFormItems.oskaFixedLabels.find(value => value === el.entityId)).sort((a, b) => {
      if(a.entityLabel.toUpperCase() < b.entityLabel.toUpperCase()) {
        return -1;
      }
      return 1;
    });
    const otherValues = this.FilterOptions.oskaFixedLabels.filter(el => !sortedSelected.find(value => value.entityId === el.entityId));
    this.filterFormItems.oskaFixedLabels = sortedSelected.map(el => el.entityId);
    this.FilterOptions.oskaFixedLabels = [...sortedSelected, ...otherValues];
    this.oskaFixedLabelsObs = of(this.FilterOptions.oskaFixedLabels);
    }
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
      oskaFieldValue: this.params['oskaFieldValue'] ? this.params['oskaFieldValue'].split(',') : "",
      oskaFieldEnabled: this.params['oskaFieldValue'] ? true : false,
      fixedLabelValue: this.params['oskaFixedLabels'] ? this.params['oskaFixedLabels'].split(',') : '',
      fixedLabelEnabled: this.params['oskaFixedLabels'] ? true : false,
      fillingBarValues: this.params['fillingBarValues'] ? this.params['fillingBarValues'].split(',') : '',
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
      if(this.params['fillingBarValues']) {
        const values = this.params['fillingBarValues'].split(',');
        responseData = responseData.filter((el) => {
          if(el.reverseOskaMainProfessionOskaFillingBarEntity.entities[0]) {
            return values.find(value => value === el.reverseOskaMainProfessionOskaFillingBarEntity.entities[0].value);
          }
          return false;
        })
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

  indicatorValues (item) {
    let res = [];
    let employed = {};
    let pay = {};
    let values = item.forEach(elem => {
      if (elem.oskaId === 1) employed = elem;
      if (elem.oskaId === 3) pay = elem;
    });
    if (employed['oskaId']) res.push(employed);
    if (pay['oskaId']) res.push(pay);
    return res;
  }
  
  formatNumber (number, locale) {
    let num = parseInt(number, 10)
    let formattedNum = num.toLocaleString(locale)
    return formattedNum.replace(',', ' ')
  }

  getCompetitionLabel (val) {
    if (val > 0 && val < 6) {
      return this.competitionLabels[val - 1];
    }
    return '';
  }
 
  ngOnInit () {
    this.showFilter = window.innerWidth > 1024;
    this.filterFull = window.innerWidth <= 1024;

    this.lang = this.rootScope.get("lang");

    this.watchParams();
    this.populateFilterOptions();
    this.filterSubmit();
    if (window.innerWidth > 1024) {
      this.filterFull = this.params['oskaFixedLabels'] || this.params['sortedBy'] || this.params['fillingBarValues'];
    }
  }
  
  ngOnDestroy () {
    this.paramsSub.unsubscribe();
  }
}
