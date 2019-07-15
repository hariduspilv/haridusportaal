import { Component, Input, HostBinding, ElementRef } from '@angular/core';

@Component({
  selector: '[htm-button]',
  template: '<span class="buton--label"><ng-content></ng-content></span>',
  styleUrls: ['./button.styles.scss'],
  host: {
    '(click)': 'onClick($event)',
  },
})

export class ButtonComponent {
  constructor(
    private el: ElementRef,
  ) {}

  @Input() theme: string = 'default';
  @HostBinding('class') get hostClasses(): string {
    return `button--${this.theme}`;
  }
  onClick($event) {

    const target = $event.originalTarget;
    const left = $event.pageX - target.offsetLeft;
    const top = $event.pageY - target.offsetTop;
    const width = target.offsetWidth;
    const ratio = width / 200;
    const speed = 0.75;

    const ripple = document.createElement('span');
    ripple.style.left = `${left}px`;
    ripple.style.top = `${top}px`;
    ripple.style.position = 'absolute';
    ripple.style.width = '1em';
    ripple.style.height = '1em';
    ripple.style.background = '#cfcfcf';
    ripple.style.marginLeft = '-0.5em';
    ripple.style.marginTop = '-0.5em';
    ripple.style.borderRadius = '1em';
    ripple.style.fontSize = `${ratio}rem`;
    ripple.style.pointerEvents = 'none';
    ripple.style.animation = `ripple ${speed}s`;
    ripple.classList.add('ripple');

    this.el.nativeElement.appendChild(ripple);
    setTimeout(
      () => {
        this.el.nativeElement.removeChild(ripple);
      },
      speed * 1000);
  }
}
