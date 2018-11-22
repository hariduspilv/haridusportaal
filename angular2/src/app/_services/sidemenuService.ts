import { Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { RootScopeService } from '@app/_services/rootScopeService';

@Injectable()
export class SideMenuService {

  private subject = new Subject<any>();

  private langSwitch = new Subject<any>();

  data: any;
  force: boolean = false;
  lang: any;
  constructor(
    private rootScope: RootScopeService
  ) {}

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

}
