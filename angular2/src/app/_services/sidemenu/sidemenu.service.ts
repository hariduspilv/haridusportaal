import { Injectable } from '@angular/core';
import { SidemenuGraph } from './sidemenu.graph';
import { Apollo } from 'apollo-angular';
import { HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class SideMenuService extends SidemenuGraph {

  private subject = new Subject<any>();

  data: any;

  constructor( private apollo: Apollo ) {
    super();
  }

  sendMessage() {

    const status = Math.random() * 1000000;

    this.subject.next({ any: status });

  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  getData(cb): any {

    const query = this.buildQuery();

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
