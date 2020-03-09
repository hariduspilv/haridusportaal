import { Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[scrollTo]',
})

export class ScrollToDirective {
  constructor(
    private el: ElementRef,
  ) {}

  @Input() scrollTo: string = '';
  @HostListener('click', ['$event']) scrollToElement($event) {
    const id = `scrollTo-${this.scrollTo}`;
    const elem:HTMLElement = document.querySelector(`#${id}`);
    const appContent:HTMLElement = document.querySelector('.app-content');
    const elemHeight = elem.offsetHeight;
    const windowHeight = appContent.offsetHeight;
    const headerHeight = appContent.getBoundingClientRect().top;
    let scrollTop = elem.getBoundingClientRect().top +
      appContent.scrollTop -
      headerHeight;

    if (elemHeight <= windowHeight) {
      scrollTop = scrollTop + (elemHeight / 2);
      scrollTop = scrollTop - (windowHeight / 2);
    }

    /* for zö debugging pöörpos
    console.log({
      elemHeight,
      windowHeight,
      scrollTop,
    });
    */

    const isIE11 = !!window['MSInputMethodContext'] && !!document['documentMode'];

    if (isIE11) {
      appContent.scrollTop = scrollTop;
    } else {
      appContent.scrollTo({
        top: scrollTop,
        behavior: 'smooth',
      });
    }

  }

}
