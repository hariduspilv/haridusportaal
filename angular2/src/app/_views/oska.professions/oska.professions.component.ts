import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpService } from 'app/_services/httpService';
import { FiltersService } from '@app/_services/filtersService';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { RootScopeService } from '@app/_services';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { DeviceDetectorService } from 'ngx-device-detector';

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
  public listLimit: number = 24;
  public step: number = 24;
  public listEnd: boolean;
  public showFilter: boolean = true;
  public filterFull: boolean = true;
  public oskaFieldValue: any = [];
  private FilterOptions: any = {};
  private filterOptionKeys = ['oskaFieldValue', 'sortedBy', 'fixedLabelValue', 'oskaFixedLabels', 'fillingBarValues'];
  public competitionLabels = ['oska.simple_extended', 'oska.quite_simple_extended', 'oska.medium_extended', 'oska.quite_difficult_extended', 'oska.difficult_extended'];
  private paramsSub: Subscription;
  private dataSub: Subscription;
  private filterSub: Subscription;
  private oskaFixedLabels: any = [];
  private oskaFixedLabelsObs: any = [];
  private fillingBarValues = [1, 2, 3, 4, 5];
  public hasComparisonPage = false;
  private sortedBy: Array<Object> = [
    { name: 'Brutopalga järgi kasvavalt', id: 'field_bruto-asc', modifier: 'ASC' },
    { name: 'Brutopalga järgi kahanevalt', id: 'field_bruto-desc', modifier: 'DESC' },
    { name: 'Hariduse pakkumise järgi kasvavalt', id: 'field_education_indicator-asc', modifier: 'ASC' },
    { name: 'Hariduse pakkumise järgi kahanevalt', id: 'field_education_indicator-desc', modifier: 'DESC' },
    { name: 'Hõivatute arvu järgi kasvavalt', id: 'field_number_of_employees-asc', modifier: 'ASC' },
    { name: 'Hõivatute arvu järgi kahanevalt', id: 'field_number_of_employees-desc', modifier: 'DESC' },
    { name: 'Hõive muutuse järgi kasvavalt', id: 'field_change_in_employment-asc', modifier: 'ASC' },
    { name: 'Hõive muutuse järgi kahanevalt', id: 'field_change_in_employment-desc', modifier: 'DESC' }
  ];
  private isFirstLoad = true;

  constructor(
    private http: HttpService,
    public router: Router,
    public route: ActivatedRoute,
    public rootScope: RootScopeService,
    public translate: TranslateService,
    private deviceService: DeviceDetectorService
  ) {
    super(null, null);
  }

  populateFilterOptions(){
    let variables = {
      lang: this.lang.toUpperCase(),
      limit: this.listLimit
    };
    this.filterSub = this.http.get('oskaMainProfessionListViewFilter', {params:variables}).subscribe((response: any) => {
      this.oskaFieldValue = response.data.oskaFields.entities;
      // Map unique indicators for ascending and descending cases
      let oskaIndicators = response.data.oskaIndicators.entities;
      let ascendingLabel = this.translate.get('oska.ascending')['value'];
      let descendingLabel = this.translate.get('oska.descending')['value'];
      this.oskaFixedLabels = response.data.oskaFixedLabels.entities;
      this.oskaFixedLabelsObs = of(this.oskaFixedLabels);
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
              this.oskaFixedLabelsSort(false);
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
    this.getData(this.params);
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

  oskaFixedLabelsSort(e) {
    if(!e) {
      let sortedSelected = []
      if(this.filterFormItems.oskaFixedLabels) {
        sortedSelected = this.FilterOptions.oskaFixedLabels.filter(el => this.filterFormItems.oskaFixedLabels.find(value => value === el.entityId)).sort((a, b) => {
        if(a.entityLabel.toUpperCase() < b.entityLabel.toUpperCase()) {
          return -1;
        }
        return 1;
      });
      const otherValues = this.FilterOptions.oskaFixedLabels.filter(el => !sortedSelected.find(value => value.entityId === el.entityId));
      this.filterFormItems.oskaFixedLabels = sortedSelected.map(el => el.entityId);
      this.FilterOptions.oskaFixedLabels = [...sortedSelected, ...otherValues];
      }
    } 
  }

  reset() {
    this.listLimit = this.step;
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
    let variables = {
      lang: this.lang.toUpperCase(),
      titleValue: this.params['titleValue'] ? "%" + this.params['titleValue'] + "%" : "",
      titleEnabled: this.params['titleValue'] ? true : false,
      oskaFieldValue: this.params['oskaFieldValue'] ? this.params['oskaFieldValue'].split(',') : "",
      oskaFieldEnabled: this.params['oskaFieldValue'] ? true : false,
      fixedLabelValue: this.params['oskaFixedLabels'] ? this.params['oskaFixedLabels'].split(',') : '',
      fixedLabelEnabled: this.params['oskaFixedLabels'] ? true : false,
      fillingBarValues: this.params['fillingBarValues'] ? this.params['fillingBarValues'].split(',') : [],
      fillingBarFilterEnabled: this.params['fillingBarValues'] ? true : false,
      sortedBy: false,
      nidEnabled: false,
      offset: this.listLimit - this.step,
      limit: this.step,
      sortField: this.params['sortedBy'] ? this.params['sortedBy'].split('-')[0] : 'title',
      sortDirection: this.params['sortedBy'] ? this.params['sortedBy'].split('-')[1].toUpperCase() : 'ASC',
      indicatorSort: this.params['sortedBy'] ? true : false,
    };
    this.dataSub = this.http.get('oskaMainProfessionListView', {params:variables}).subscribe((response: any) => {
      let responseVal: any = response['data']['nodeQuery'];
      this.loading = false;
      if (response['errors']) {
        this.loading = false;
        this.data = [];
        this.errMessage = response['errors'][0]['message'];
      }
      this.hasComparisonPage = response.data.comparisonPage.count;
      this.data = this.data && this.data.length ? [...this.data, ...responseVal['entities']] : responseVal['entities'];
      if( responseVal.count <= this.listLimit ){ 
        this.listEnd = true;
      } else this.listEnd = false;
      this.dataSub.unsubscribe();
      if (this.deviceService.isMobile() && this.isFirstLoad === false) {
        let elem = document.getElementById('searchHead');
        elem.scrollIntoView({behavior: "smooth", block: "start"});
      }
      this.isFirstLoad = false;
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
 
  changeView() {
    this.router.navigate(['ametialad/andmed'])
  }

  ngOnInit () {
    this.showFilter = this.deviceService.isDesktop();
    this.filterFull = this.deviceService.isMobile() || this.deviceService.isTablet();

    this.lang = this.rootScope.get("lang");

    this.watchParams();
    this.populateFilterOptions();
    this.filterSubmit();
    if (this.deviceService.isDesktop()) {
      this.filterFull = this.params['oskaFixedLabels'] || this.params['sortedBy'] || this.params['fillingBarValues'];
    }
  }
  
  ngOnDestroy () {
    this.paramsSub.unsubscribe();
  }
}
