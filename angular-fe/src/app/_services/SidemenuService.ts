import { Injectable, OnInit } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

@Injectable( {
  providedIn: 'root',
})
export class SidemenuService {

  private subject:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private langSwitch = new Subject<any>();

  force = false;
  lang: any;

  get isVisible() {
    return this.subject.getValue();
  }

  get isVisibleSubscription() {
    return this.subject;
  }
  toggle() {
    this.subject.next(!this.subject.getValue());
  }

  triggerLang(force:boolean = false) {

    // force language switch on login to load main nav
    this.force = force;

    this.langSwitch.next({ any: Math.random() * 1000000 });
  }
}
