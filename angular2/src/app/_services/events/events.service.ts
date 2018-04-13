import { Injectable } from '@angular/core';
import { EventsGraph } from './events.graph';
import { Apollo } from 'apollo-angular';
import { HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { RootScopeService } from '../rootScope/rootScope.service';

@Injectable()
export class EventsService extends EventsGraph {

  data: any;

  lang: any;

  constructor( private apollo: Apollo, private rootScope: RootScopeService) {
    super();
  }

  getList(path, cb): any {

    this.lang = this.rootScope.get('currentLang');

    const query = this.buildList(this.lang);

    this.apollo.query({
      query: query,
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
      context: {
        headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
      }
    }).subscribe(({data}) => {
      cb(data);
    });

  }

}
