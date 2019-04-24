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
  loading: boolean = true;
  listEnd: boolean = false;
  limit: number = 24;

  constructor(
		private rootScope: RootScopeService,
    private http: HttpService
  ) { }

  getData() {

    this.loading = true;

    let variables = {
      schoolId: this.schoolId.toString(),
      lang: this.rootScope.get('lang').toUpperCase(),
      limit: this.limit,
      offset: this.programmes ? this.programmes.length : 0
    };
    
    let subscribe = this.http.get('relatedStudyProgrammeList', { params: variables }).subscribe( (response) => {
      let data = response['data'];
      this.loading = false;

      if( this.programmes ){
        this.programmes = [ ... this.programmes, ...data.nodeQuery.entities ];
      }else{
        this.programmes = data.nodeQuery.entities;
      }

      if( data.nodeQuery.entities.length < this.limit ){
        this.listEnd = true;
      }
      subscribe.unsubscribe();
    });
  }

  ngOnInit() {
    this.getData();
  }

  ngOnDestroy() {
  }

}
