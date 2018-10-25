import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpService } from 'app/_services/httpService';
import { FiltersService } from '@app/_services/filtersService';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { RootScopeService } from '@app/_services';

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
  public limit: number = 5;
  public offset: number = 0;
  public listEnd: boolean;
  public showFilter: boolean = true;
  public filterFull: boolean = true;
  public oskaFieldValue: any;
  public oskaIndicatorValue: any;
  private FilterOptions: object = {};
  private filterOptionKeys = ['oskaFieldValue', 'oskaIndicatorValue', 'fixedLabelValue'];
  private paramsSub: Subscription;
  private langSub: Subscription;
  private dataSub: Subscription;
  private filterSub: Subscription;

  constructor(
    private http: HttpService,
    public router: Router,
    public route: ActivatedRoute,
    public rootScope: RootScopeService
  ) {
    super(null, null);
  }


  populateFilterOptions(){
    let variables = {
      lang: this.lang.toUpperCase(),
      limit: 100
    };
    this.filterSub = this.http.get('/graphql?queryId=oskaMainProfessionListViewFilter:1&variables=' + JSON.stringify(variables)).subscribe(response => {
      this.oskaFieldValue = response['data']['oskaFields']['entities'];
      this.oskaIndicatorValue = response['data']['oskaIndicators']['entities'];
      for(let i in this.filterOptionKeys){
        if( this.params[this.filterOptionKeys[i]] !== undefined && this.filterOptionKeys[i] === 'fixedLabelValue') {
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
    this.offset += 5;
    this.getData(this.params);
  }

  reset() {
    this.offset = 0;
    this.limit = 5;
    this.data = false;
    this.getData(this.params);
  }

  getData (params) {
    this.loading = true;
    this.errMessage = false;
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
    let variables = {
      lang: this.lang.toUpperCase(),
      titleValue: this.params['titleValue'] ? encodeURIComponent("%" + this.params['titleValue'] + "%") : "",
      titleEnabled: this.params['titleValue'] ? true : false,
      oskaFieldValue: this.params['oskaFieldValue'] ? this.params['oskaFieldValue'] : "",
      oskaFieldEnabled: this.params['oskaFieldValue'] ? true : false,
      fixedLabelValue: this.params['fixedLabelValue'] ? '1' : '0',
      fixedLabelEnabled: this.params['fixedLabelValue'] ? true : false,
      nidEnabled: false,
      offset: this.offset,
      limit: this.limit
    };
    this.dataSub = this.http.get('/graphql?queryId=oskaMainProfessionListView:1&variables=' + JSON.stringify(variables)).subscribe(response => {
      if (response['errors']) {
        this.loading = false;
        this.errMessage = response['errors'][0]['message'];
      }
      this.loading = false;
      let responseData = response['data']['nodeQuery']['entities'];
      this.data = this.data ? [...this.data, ...responseData] : responseData;
      if( responseData.length < this.limit ){ 
        this.listEnd = true;
      } else this.listEnd = false;
      this.dataSub.unsubscribe();
      let focusTarget = (this.offset - 1).toString();
      document.getElementById(focusTarget).focus();
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
    this.filterFull = window.innerWidth < 1024;

    this.langSub = this.route.params.subscribe((params: ActivatedRoute) => {
      this.lang = params['lang'];
    });
    this.rootScope.set('langOptions', {
      'en': '/en/professions',
      'et': '/et/ametialad'
    });

    this.watchParams();
    this.populateFilterOptions();
    this.filterSubmit();
    this.filterFull = this.params['fixedLabelValue'];
  }
  
  ngOnDestroy () {
    this.langSub.unsubscribe();
    this.paramsSub.unsubscribe();
  }
}
