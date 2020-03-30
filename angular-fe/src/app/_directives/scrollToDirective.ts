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
    const isEdge = window.navigator.userAgent.indexOf('Edge') > -1;

    if (isIE11 || isEdge) {
      appContent.scrollTop = scrollTop;
    } else {
      appContent.scrollTo({
        top: scrollTop,
        behavior: 'smooth',
      });
    }

    setTimeout(
      () => {
        if (elem.querySelector('h1')) {
          elem.querySelector('h1').focus();
        } else if (elem.querySelector('h2')) {
          elem.querySelector('h2').focus();
        } else if (elem.querySelector('h3')) {
          elem.querySelector('h3').focus();
        } else if (elem.querySelector('button')) {
          elem.querySelector('button').focus();
        }
      },
      500);
  }

}
