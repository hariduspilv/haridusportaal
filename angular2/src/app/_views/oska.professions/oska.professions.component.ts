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
  private FilterOptions: object = {};
  private filterOptionKeys = ['oskaFieldValue','fixedLabelValue'];
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
      lang: this.lang.toUpperCase()
    };
    this.filterSub = this.http.get('/graphql?queryId=oskaMainProfessionListViewFilter:1&variables=' + JSON.stringify(variables)).subscribe(response => {
      this.oskaFieldValue = response['data']['nodeQuery']['entities'];
      for(let i in this.filterOptionKeys){
        if( this.params[this.filterOptionKeys[i]] !== undefined ){
          this.filterFormItems[this.filterOptionKeys[i]] = parseInt(this.params[this.filterOptionKeys[i]]);
        }
        if( this[this.filterOptionKeys[i]] ) {
          this.FilterOptions[this.filterOptionKeys[i]] = this[this.filterOptionKeys[i]];
        }
      }
      this.filterSub.unsubscribe();
    }, (err) => {})
  };

  loadMore(){
    this.offset = this.limit;
    this.limit += 5;
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
      titleValue: this.params['titleValue'] ? "%"+this.params['titleValue']+"%" : "",
      titleEnabled: this.params['titleValue'] ? true : false,
      oskaFieldValue: this.params['oskaFieldValue'] ? this.params['oskaFieldValue'] : "",
      oskaFieldEnabled: this.params['oskaFieldValue'] ? true : false,
      fixedLabelValue: this.params['fixedLabelValue'] ? '1' : '0',
      fixedLabelEnabled: this.params['fixedLabelValue'] ? true : false,
      nidEnabled: false,
      offset: this.offset,
      limit: this.limit,
      fetchPolicy: 'no-cache',
      errorPolicy: 'all'
    };
    this.dataSub = this.http.get('/graphql?queryId=oskaMainProfessionListView:1&variables=' + JSON.stringify(variables)).subscribe(response => {
      if (response['errors']) {
        this.loading = false;
        this.errMessage = response['errors'][0]['message'];
      }
      
      let responseData = response['data']['nodeQuery']['entities'];
      this.data = this.data ? [...this.data, ...responseData] : responseData;
      if( this.data && (this.data.length < this.limit) ){ 
        this.listEnd = true;
      } else this.listEnd = false;
      this.loading = false;
      this.dataSub.unsubscribe();
    }, (err) => {
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
  }
  
  ngOnDestroy () {
    this.langSub.unsubscribe();
    this.paramsSub.unsubscribe();
  }
}
