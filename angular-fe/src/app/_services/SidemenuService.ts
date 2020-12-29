import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidemenuService {

  private subject:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private langSwitch = new Subject<any>();

  /**
   * These paths should not open the menu automatically on load.
   */
  public ignoreAutoOpen = ['/', '/õppimine', '/karjäär', '/õpetaja', '/noored'];

  force = false;
  lang: any;

  get isVisible() {
    return this.subject.getValue();
  }

  get isVisibleSubscription() {
    return this.subject;
  }

  get isMobileView() {
    return window.innerWidth <= 1024;
  }

  toggle() {
    this.subject.next(!this.subject.getValue());
  }

  close() {
    this.subject.next(false);
  }

  triggerLang(force:boolean = false) {

    // force language switch on login to load main nav
    this.force = force;

    this.langSwitch.next({ any: Math.random() * 1000000 });
  }
}
