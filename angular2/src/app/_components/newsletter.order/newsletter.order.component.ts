import { Component, OnInit, OnDestroy } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { getTags } from '../../_services/newsletter/newsletter.graph';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
	selector: 'newsletter-order',
	templateUrl: './newsletter.order.component.html',
})

export class NewsletterOrderComponent implements OnInit, OnDestroy{

  subscriptions: Subscription[] = [];

  lang: string;

  constructor(
    private apollo: Apollo,
    private route: ActivatedRoute,
    private router: Router
  ){}

  ngOnInit() {

    const paramsSub = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.lang = params['lang'];
      }
    )

    this.subscriptions = [...this.subscriptions, paramsSub];

    const tagSubscription = this.apollo.watchQuery({
      query: getTags,
      variables: {
        lang: this.lang.toUpperCase(),
        fetchPolicy: 'no-cache',
        errorPolicy: 'all'
      },
    })
    .valueChanges
    .subscribe(({data}) => {
      console.log(data);
    });
    this.subscriptions = [...this.subscriptions, tagSubscription];

  }

  ngOnDestroy() {
    for( let item of this.subscriptions ) {
      if ( item && item.unsubscribe ) {
        item.unsubscribe();
      }
    }
  }

}

