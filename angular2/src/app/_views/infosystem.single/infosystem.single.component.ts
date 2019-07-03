import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';
import { HttpService } from '@app/_services/httpService';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: "infosystem",
  templateUrl: './infosystem.single.template.html',
  styleUrls: ['./infosystem.single.styles.scss']
})

export class InfosystemSingle implements OnInit, OnDestroy {

  @Input() inputData: any;

  public data: any = {}
  public loading: boolean = true;
  public view: string = "details";
  public sub: Subscription;

  constructor(
    private http: HttpService,
    private router: Router,
    private location: Location
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }
  
  changeView(view) {
    if(this.view !== view) {
      this.view = view;
      let url = this.router.url.split('?')[0]
      this.location.go(`${url}?view=${view === 'guides' ? 2 : 1}`);
    }
  }

  async getData() {
    if (this.sub) this.sub.unsubscribe();
    const params = {
      path: this.router.url
    }
    this.sub = await this.http.get('infoSystemPage', { params }).subscribe((res:any) => {
      this.loading = false;
      this.data = res.data.route.entity;
    }, (err) => {
      console.log(err);
      this.loading = false;
    }, () => {
      this.sub.unsubscribe();
    });
  }

  ngOnInit() {
    if (this.inputData) {
      this.data = this.inputData;
      this.loading = false;
    } else {
      this.getData();
    }
    if (window.location.search === '?view=2') {
      this.changeView('guides');
    }
  }
  ngOnDestroy() {

  }
}
