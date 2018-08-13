import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription';

import { SingleQuery, InstitutionTypeQuery } from '../../_services/school/school.service';
import { RootScopeService } from '../../_services';

@Component({
  templateUrl: './schools.single.component.html',
  styleUrls: ['./schools.single.component.scss']
})
export class SchoolsSingleComponent implements OnInit, OnDestroy {

  loading = true;
  data: any;
  path: String;
  types: any;

  private querySubscription: Subscription;

  constructor(
    private apollo: Apollo,
    private route: ActivatedRoute,
    private router: Router,
    private rootScope: RootScopeService
  ) {}

  ngOnInit() {
    this.querySubscription = this.apollo.watchQuery<any>({
      query: SingleQuery,
      variables: {
        path: this.router.url
      },
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    }).valueChanges.subscribe(({ data, loading }) => {
      this.loading = loading;
      if (data) {
        this.data = data.route.entity;
        if (data.route.entity.fieldEducationalInstitutionTy.length) {
          let types = data.route.entity.fieldEducationalInstitutionTy.map(type => type.entity.entityId)
          this.getOptions(types)
        }
      }
    });
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }

  getOptions(types) {
    let subscription = this.apollo.watchQuery({
      query: InstitutionTypeQuery,
      variables: {
        "lang": this.rootScope.get('currentLang').toUpperCase(),
        "tids": types
      },
      fetchPolicy: 'no-cache',
      errorPolicy: 'none',
    }).valueChanges.subscribe( ({data}) => {
      let initialData = data['taxonomyTermQuery']['entities'];
      let children = initialData.filter(elem => elem.parentId);
      let parents = initialData.filter(elem => !children.includes(elem))
      let connections = parents.map(parent => {
        return children.filter((child) => {
          return child.parentId.toString() === parent.entityId;
        });
      });
      this.types = parents.map((elem, index) => {
        return {...elem, children: [...connections[index]]};
      })
      subscription.unsubscribe();
    });
  }
}
