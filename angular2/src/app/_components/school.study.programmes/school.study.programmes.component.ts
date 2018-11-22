import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { RootScopeService } from '@app/_services/rootScopeService';
import { Subscription } from 'rxjs/Subscription';

import { HttpService } from '@app/_services/httpService';

@Component({
  selector: 'school-study-programmes',
  templateUrl: './school.study.programmes.component.html',
  styleUrls: ['./school.study.programmes.component.scss']
})
export class SchoolStudyProgrammesComponent implements OnInit {

  @Input() schoolId: number;
  @Input() schoolName: String;
  programmes: any;
  loading = true;

  constructor(
		private rootScope: RootScopeService,
    private http: HttpService
  ) { }

  ngOnInit() {

    let url = "/graphql?queryName=relatedStudyProgrammes&queryId=c72f6c17ef0593b31753c9094b69d89b845383bb:1&variables=";
    let variables = {
      schoolId: this.schoolId.toString(),
      lang: this.rootScope.get('currentLang').toUpperCase()
    };
    
    let subscribe = this.http.get(url+JSON.stringify(variables)).subscribe( (response) => {
      let data = response['data'];
      this.loading = false;
      this.programmes = data.nodeQuery.entities;
      subscribe.unsubscribe();
    });

  }

  ngOnDestroy() {
  }

}
