import { Component, OnInit } from '@angular/core';
import { HttpService } from 'app/_services/httpService';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { RootScopeService } from '@app/_services';

@Component({
  templateUrl: "oska.mainprofession.compare.template.html",
  styleUrls: ["../oska.sectors/oska.sectors.styles.scss"]
})

export class OskaMainProfessionCompareComponent implements OnInit {
  
  public data: any = false;
  public loading: boolean = false;
  public dataReceived: boolean = false;
  public errMessage: any = false;
  public lang: string;
  private dataSub: Subscription;
  public paramsSub: Subscription;

  constructor(
    private http: HttpService,
    public router: Router,
    public route: ActivatedRoute,
    public rootScope: RootScopeService,
  ) {}

  changeView() {
    this.router.navigate(['ametialad']);
  }

  getData () {
    this.loading = true;
    this.errMessage = false;
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
    let variables = {
      lang: this.lang.toUpperCase(),
    };
    this.dataSub = this.http.get('oskaMainProfessionComparsionPage', {params:variables}).subscribe((response: any) => {
      if (response.errors) {
        this.loading = false;
        this.errMessage = true;
      }
      this.data = response.data.nodeQuery.entities;
      this.loading = false;
      this.dataReceived = true;
    }, (err) => {
      this.errMessage = true
      this.loading = false;
    })
  }

  ngOnInit () {
    this.lang = this.rootScope.get("lang");
    this.getData()
  }
  ngAfterViewInit() {
    if (this.dataReceived) {
      document.getElementById('heading').focus();
      this.dataReceived = false;
    }
  }
}
