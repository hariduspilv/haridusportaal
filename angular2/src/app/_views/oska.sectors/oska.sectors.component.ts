import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpService } from 'app/_services/httpService';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { RootScopeService } from '@app/_services';

@Component({
  templateUrl: "oska.sectors.template.html",
  styleUrls: ["oska.sectors.styles.scss"]
})

export class OskaSectorsComponent implements OnInit, OnDestroy {

  public data: any = false;
  public loading: boolean = false;
  public errMessage: any = false;
  public lang: string;
  public limit: number = 100;
  public offset: number = 0;
  private langSub: Subscription;
  private dataSub: Subscription;

  constructor(
    private http: HttpService,
    public router: Router,
    public route: ActivatedRoute,
    public rootScope: RootScopeService
  ) {}

  getData () {
    this.loading = true;
    this.errMessage = false;
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
    let variables = {
      lang: this.lang.toUpperCase(),
      offset: this.offset,
      limit: this.limit,
      nidEnabled: false
    };
    this.dataSub = this.http.get('/graphql?queryName=oskaFieldListView&queryId=646bab2dc9f74461b9cf3961f7443abd5b1039e3:1&variables=' + JSON.stringify(variables)).subscribe(response => {
      if (response['errors']) {
        this.loading = false;
        this.errMessage = true;
      }
      this.data = response['data']['nodeQuery']['entities'];
      this.loading = false;
    }, (err) => {
      this.errMessage = true
      this.loading = false;
    })
  }

  ngOnInit () {
    this.langSub = this.route.params.subscribe((params: ActivatedRoute) => {
      this.lang = params['lang'];
    });
    this.rootScope.set('langOptions', {
      'en': '/en/sectors',
      'et': '/et/valdkonnad'
    });
    this.getData()
  }
  
  ngOnDestroy () {
    this.langSub.unsubscribe();
  }
}
