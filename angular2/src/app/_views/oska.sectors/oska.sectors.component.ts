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
    this.dataSub = this.http.get('/graphql?queryName=oskaFieldListView&queryId=22a08139aac421effe05769ce983ff940de0d59d:1&variables=' + JSON.stringify(variables)).subscribe(response => {
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

    this.lang = this.rootScope.get("lang");
    this.getData()

  }
  
  ngOnDestroy () {

  }
}
