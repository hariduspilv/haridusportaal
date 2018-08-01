import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription';

import { SchoolStudyProgrammes } from '../../_services/studyProgramme/studyProgramme.service';

@Component({
  selector: 'school-study-programmes',
  templateUrl: './school.study.programmes.component.html',
  styleUrls: ['./school.study.programmes.component.scss']
})
export class SchoolStudyProgrammesComponent implements OnInit {

  @Input() schoolId: number;
  programmes: any;
  loading = true;
  private querySubscription: Subscription;

  constructor(
    private apollo: Apollo
  ) { }

  ngOnInit() {
    this.querySubscription = this.apollo.watchQuery<any>({
      query: SchoolStudyProgrammes,
      variables: {
        schoolId: this.schoolId.toString(),
        lang: 'ET'
      },
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    })
      .valueChanges
      .subscribe(({ data, loading }) => {
        this.loading = loading;
        this.programmes = data.nodeQuery.entities;
      });
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }

}
