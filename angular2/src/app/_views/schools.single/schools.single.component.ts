import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription';

import { SingleQuery } from '../../_services/school/school.service';

@Component({
  templateUrl: './schools.single.component.html',
  styleUrls: ['./schools.single.component.scss']
})
export class SchoolsSingleComponent implements OnInit, OnDestroy {

  loading = true;
  data = {};
  path: String;

  private querySubscription: Subscription;

  constructor(
    private apollo: Apollo,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.querySubscription = this.apollo.watchQuery<any>({
      query: SingleQuery,
      variables: {
        path: this.router.url
      },
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    })
      .valueChanges
      .subscribe(({ data, loading }) => {
        this.loading = loading;
        this.data = data;
      });
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }

}
