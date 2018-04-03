import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()

export class SideMenuService {

    private subject = new Subject<any>();

    sendMessage() {

      const status = Math.random() * 1000000;

      this.subject.next({ any: status });

    }

    getMessage(): Observable<any> {
      return this.subject.asObservable();
    }

}
