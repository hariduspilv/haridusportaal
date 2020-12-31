import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidemenuService {

  private subject:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private theme:BehaviorSubject<string> = new BehaviorSubject<string>('default');
  private langSwitch = new Subject<any>();

  /**
   * These paths should not open the menu automatically on load.
   */
  public ignoreAutoOpen = ['/', '/õppimine', '/karjäär', '/õpetaja', '/noored'];
  public themes = {
    õppimine: 'learning',
    õpetamine: 'teaching',
    karjäär: 'career',
    noored: 'youth',
    noortevaldkond: 'youth',
  };

  force = false;
  lang: any;

  get isVisible() {
    return this.subject.getValue();
  }

  get isVisibleSubscription() {
    return this.subject;
  }

  get currentTheme(): string {
    return this.theme.getValue();
  }

  get themeSubscription() {
    return this.theme;
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

  setTheme(theme: string): void {
    this.theme.next(theme);
  }

  triggerLang(force:boolean = false) {

    // force language switch on login to load main nav
    this.force = force;

    this.langSwitch.next({ any: Math.random() * 1000000 });
  }
}
