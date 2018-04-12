import { Injectable } from '@angular/core';
import { EventsGraph } from './events.graph';
import { Apollo } from 'apollo-angular';
import { HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class EventsService extends EventsGraph {

  data: any;

  constructor( private apollo: Apollo ) {
    super();
  }

  getList(path, cb): any {

    const query = this.buildList();

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
