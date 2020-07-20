import { Component, Input, OnInit, OnDestroy} from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { MetaTagsService } from '@app/_services/metaTagsService';
import { HttpService } from '@app/_services/httpService';
import { RootScopeService } from '@app/_services';
import { Location } from '@angular/common';
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
  public unclickables: Array<string> = ['/töölaud'];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private metaTags: MetaTagsService,
    private http: HttpService,
    private rootScope: RootScopeService
  ) {}
  
  getData() {
    // GET BREADCRUMB

    let url = "getBreadcrumbs";
    let variables = {
      path: this.path
    };

    const breadcrumbSubscription = this.http.get(url, {params: variables}).subscribe((response) => {
      let data = response['data'];
      
      if( !data['route'] ){
        this.router.navigateByUrl(`/404`, { skipLocationChange: true });
        return;
      }
      this.metaTags.set(data['route']['entity']['entityMetatags']);
      this.breadcrumb = data['route']['breadcrumb'];
      this.breadcrumb.forEach(elem => elem.disableLink = this.unclickables.includes(elem.url.path));
    });

    this.subscriptions = [...this.subscriptions, breadcrumbSubscription];
  }
  private updateBreadcrumbs(){
    this.path = this.location.path().split('?')[0];
    if( this.path !== this.prevPath && this.path.includes('/t%C3%B6%C3%B6laud/') && this.prevPath.includes('/t%C3%B6%C3%B6laud/')){
      this.prevPath = this.path;
      let title = decodeURIComponent(this.path.split('/')[2]);
      this.breadcrumb[2].text = `${title.charAt(0).toUpperCase()}${title.substr(1).toLowerCase()}`;
    } else if( this.path !== this.prevPath ){
      this.prevPath = this.path;
      this.breadcrumb = [];
      this.getData();
    }
  }
  ngOnInit() {
    this.lang = this.rootScope.get("lang");
    const eventsSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateBreadcrumbs();
      }
    });

    this.updateBreadcrumbs();

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