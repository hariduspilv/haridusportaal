import { Component, Input, HostBinding, ElementRef } from '@angular/core';
import { RippleService } from '@app/_services';

@Component({
  selector: '[htm-button]',
  template: '<span class="button--label"><ng-content></ng-content></span>',
  styleUrls: ['./button.styles.scss'],
  host: {
    '(mousedown)': 'animateRipple($event)',
    '(keydown.enter)' : 'animateRipple($event)',
  },
})

export class ButtonComponent {
  @Input() class: string;

  constructor(
    private el: ElementRef,
    private ripple: RippleService,
  ) {}

  @Input() theme: string = 'default';

  @HostBinding('class') get hostClasses(): string {
    return `button--${this.theme} ${this.class}`;
  }
  animateRipple($event) {
    const rippleColor = this.theme === 'plain' ? 'dark' : 'light';
    this.ripple.animate($event, rippleColor);
  }
}
