import { Component, Input, OnInit, OnDestroy} from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Apollo } from 'apollo-angular';

import { getBreadcrumb } from '@app/_graph/breadcrumb.graph';
import { MetaTagsService } from '@app/_services/metaTagsService';
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
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apollo: Apollo,
    private metaTags: MetaTagsService
  ) {}
  
  getData() {
    // GET BREADCRUMB
    const breadcrumbSubscription = this.apollo.watchQuery({
      query: getBreadcrumb,
      variables: {
        path: this.path,
        lang: this.lang.toUpperCase(),
      },
      fetchPolicy: 'no-cache',
      errorPolicy: 'all'
    })
    .valueChanges
    .subscribe(({data}) => {

      if( !data['route'] ){
        history.replaceState({}, '', `/${this.lang}`);
        this.router.navigateByUrl(`/${this.lang}/404`);
      }
      this.metaTags.set(data['route']['entity']['entityMetatags']);
      this.breadcrumb = data['route']['breadcrumb'];
    });

    this.subscriptions = [...this.subscriptions, breadcrumbSubscription];
  }
  private updateBreadcrumbs(){
    this.path = this.router.url;
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