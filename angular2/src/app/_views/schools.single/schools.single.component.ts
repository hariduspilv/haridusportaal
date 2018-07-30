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
  data: any;
  path: String;
  schoolLocations = [];

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
        if (data) {
          this.data = data.route.entity;
          for (let i = 0; i < this.data.fieldSchoolLocation.length; i++) {
            this.schoolLocations[i] = {};
            this.schoolLocations[i].entity = this.data.fieldSchoolLocation[i].entity;
            this.schoolLocations[i].lat = parseFloat(this.data.fieldSchoolLocation[i].entity.fieldCoordinates.lat);
            this.schoolLocations[i].lon = parseFloat(this.data.fieldSchoolLocation[i].entity.fieldCoordinates.lon);
            if (this.data.fieldSchoolLocation[i].entity.fieldCoordinates.zoom != 'null') {
              this.schoolLocations[i].zoom = parseInt(this.data.fieldSchoolLocation[i].entity.fieldCoordinates.zoom);
            } else {
              this.schoolLocations[i].zoom = 12;
            }
          }
        }
      });
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }

}
