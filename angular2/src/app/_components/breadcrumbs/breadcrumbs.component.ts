import { Component, Input, OnInit, OnDestroy} from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { MetaTagsService } from '@app/_services/metaTagsService';
import { HttpService } from '@app/_services/httpService';
@Component({
  selector: 'breadcrumbs',
  templateUrl: 'breadcrumbs.component.html',
})

export class BreadcrumbsComponent implements OnInit, OnDestroy {
  //@Input() custom: string;

  subscriptions: Subscription[] = [];
  
  path: string;
  prevPath: string = "";
  lang: string;
  breadcrumb: any;
  public unclickables: Array<string> = ['/et/toolaud', '/en/dashboard'];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private metaTags: MetaTagsService,
    private http: HttpService
  ) {}
  
  getData() {
    // GET BREADCRUMB

    let url = "/graphql?queryName=getBreadcrumbs&queryId=57f49f8c29ee9cd9a7c9c63deefcede45fde9ef9:1&variables=";
    let variables = {
      path: this.path
    };

    const breadcrumbSubscription = this.http.get(url+JSON.stringify(variables)).subscribe((response) => {
      let data = response['data'];
      if( !data['route'] ){
        this.router.navigateByUrl("/" + this.lang + "/404", {replaceUrl: true});
      }
      this.metaTags.set(data['route']['entity']['entityMetatags']);
      this.breadcrumb = data['route']['breadcrumb'];
      this.breadcrumb.forEach(elem => elem.disableLink = this.unclickables.includes(elem.url.path));
    });

    this.subscriptions = [...this.subscriptions, breadcrumbSubscription];
  }
  private updateBreadcrumbs(){
    this.path = this.router.url.split('?')[0];
    if( this.path !== this.prevPath ){
      this.prevPath = this.path;
      this.breadcrumb = [];
      this.getData();
    }
  }
  ngOnInit() {
    const paramsSub = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        
        this.lang = params['lang'];
        this.updateBreadcrumbs();
       
      }
    );
    const eventsSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {       
        this.updateBreadcrumbs();
      }
    });

    this.subscriptions = [...this.subscriptions, paramsSub];
    this.subscriptions = [...this.subscriptions, eventsSub];
    
    
  }

  ngOnDestroy() {
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
}