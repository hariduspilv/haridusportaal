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
  public title: string = "";
  public limit: number = 5;
  public showFilter: boolean = true;
  public filterFull: boolean = true;
  private paramsSub: Subscription;
  private langSub: Subscription;
  private dataSub: Subscription;

  constructor(
    private http: HttpService,
    public router: Router,
    public route: ActivatedRoute,
    public rootScope: RootScopeService
  ) {
    super(null, null);
  }

  getData (params) {
    this.loading = true;
    this.errMessage = false;
    this.data = false;
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
    let variables = {
      lang: this.lang,
      title: params.title || "",
      limit: this.limit,
      fixed_label: "1",
      status: "1",
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    }
    this.dataSub = this.http.get('/graphql?queryId=oskaMainProfessionListView:1&variables=' + JSON.stringify(variables)).subscribe(response => {
      if (response['errors']) {
        this.loading = false;
        this.errMessage = response['errors'][0]['message'];
      }
      this.data = response['data']['CustomElasticQuery'];
      this.loading = false;
      this.dataSub.unsubscribe();
    }, (err) => {
      console.log(err)
      this.loading = false;
    })
  }

  watchParams () {
    this.paramsSub = this.route.queryParams.subscribe((params: ActivatedRoute) => {
      this.params = params;
      this.getData(params);
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
      'et': '/et/pohikutsealad'
    });

    this.watchParams();
    this.filterSubmit();
  }
  
  ngOnDestroy () {
    this.langSub.unsubscribe();
    this.paramsSub.unsubscribe();
  }
}
