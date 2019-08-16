import { Injectable, OnInit } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

@Injectable( {
  providedIn: 'root',
})
export class SidemenuService {

  private subject:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get isVisible() {
    return this.subject.getValue();
  }

  get isVisibleSubscription() {
    return this.subject;
  }
  toggle() {
    this.subject.next(!this.subject.getValue());
  }
}
