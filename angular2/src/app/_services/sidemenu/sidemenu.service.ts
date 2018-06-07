import { Injectable } from '@angular/core';
import { SidemenuGraph } from './sidemenu.graph';
import { Apollo } from 'apollo-angular';
import { HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { RootScopeService } from '../rootScope/rootScope.service';

@Injectable()
export class SideMenuService extends SidemenuGraph {

  private subject = new Subject<any>();

  private langSwitch = new Subject<any>();

  data: any;
  force: boolean = false;
  lang: any;
  constructor( private apollo: Apollo, private rootScope: RootScopeService) {
    super();
  }

  sendMessage() {

    const status = Math.random() * 1000000;

    this.subject.next({ any: status });

  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  triggerLang(force:boolean = false) {

    // force language switch on login to load main nav
    this.force = force;

    this.langSwitch.next({ any: Math.random() * 1000000 });
  }
  updateLang(): Observable<any> {
    return this.langSwitch.asObservable();
  }

  getData(cb): any {

    if( this.rootScope.get('currentLang') === undefined ){
      return false;
    }

    if(  this.rootScope.get('currentLang').toUpperCase() == this.lang && !this.force){ return false; }

    this.force = false;

    this.lang = this.rootScope.get('currentLang').toUpperCase();
    
    const query = this.buildQuery( this.lang );

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
