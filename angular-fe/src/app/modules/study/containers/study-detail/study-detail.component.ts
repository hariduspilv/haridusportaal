import {Component} from '@angular/core';
import {StudyApiService} from '@app/modules/study/study-api.service';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {StudyDetailViewQuery} from '@app/modules/study/models/study-detail-view-query';
import {MappedStudyPage} from '@app/modules/study/models/mapped-study-page';
import {StudyUtility} from "@app/modules/study/study-utility";

@Component({
  selector: 'study-detail',
  templateUrl: './study-detail.component.html',
  styleUrls: ['./study-detail.component.scss'],
})
export class StudyDetailComponent {

  public loading = true;
  public studyPath = `/uuringud/${this.route.snapshot.params.id}`;
  public study$: Observable<MappedStudyPage> = this.api.studyDetailViewQuery(this.studyPath)
    .pipe(
      tap(() => this.loading = false, error => console.log('Error: ', error)),
      map((response: StudyDetailViewQuery) => StudyUtility.mapStudyDetailData(response?.data?.route?.entity))
      // map((response: StudyDetailViewQuery) => response?.data?.route?.entity)
    );

  constructor(
    private api: StudyApiService,
    private route: ActivatedRoute,
  ) {
  }

}
