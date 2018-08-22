import { Component, OnInit, OnDestroy} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Apollo } from 'apollo-angular';

import { getBreadcrumb } from '../../_services/breadcrumb.graph';
import { MetaTagsService } from '../../_services/metaTags/metaTags.service';
@Component({
  selector: 'breadcrumbs',
  templateUrl: 'breadcrumbs.component.html',
})

export class BreadcrumbsComponent implements OnInit, OnDestroy {
  
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
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
    })
    .valueChanges
    .subscribe(({data}) => {

      if( !data['route'] ){
        this.router.navigateByUrl(`/${this.lang}/404`);
      }
      this.metaTags.set(data['route']['entity']['entityMetatags']);
      this.breadcrumb = data['route']['breadcrumb'];
    });

    this.subscriptions = [...this.subscriptions, breadcrumbSubscription];
  }
  ngOnInit() {
    const paramsSub = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        
        this.path = this.router.url;
        this.lang = params['lang'];

        if( this.path !== this.prevPath ){
          this.prevPath = this.path;
          this.breadcrumb = [];
          this.getData();
        }
      }
    );

    this.subscriptions = [...this.subscriptions, paramsSub];
    
    
  }

  ngOnDestroy() {
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
}