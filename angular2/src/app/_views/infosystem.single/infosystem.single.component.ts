import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpService } from '@app/_services/httpService';
import { RootScopeService } from '@app/_services';
import { Router } from '@angular/router';

@Component({
  selector: "infosystem",
  templateUrl: './infosystem.single.template.html',
  styleUrls: ['./infosystem.single.styles.scss']
})

export class InfosystemSingle implements OnInit, OnDestroy {

  public data: any = {}
  public loading: boolean = true;
  public view: string = "details";

  constructor(
    private http: HttpService,
    private rootScope: RootScopeService,
    private router: Router
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }
  
  changeView(view) {
    if(this.view !== view) {
      this.view = view;
    }
  }

  async getData() {
    const params = {
      path: this.router.url
    }
    const sub = await this.http.get('infoSystemPage', { params }).subscribe((res:any) => {
      this.loading = false;
      this.data = res.data.route.entity;
      console.log(this.data);
    }, (err) => {
      console.log(err);
      this.loading = false;
    }, () => {
      sub.unsubscribe();
    });
  }

  ngOnInit() {
    this.getData();
  }
  ngOnDestroy() {

  }
}
