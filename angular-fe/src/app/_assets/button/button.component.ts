import { Component, Input, HostBinding, ElementRef } from '@angular/core';
import { RippleService } from '@app/_services';

@Component({
  selector: '[htm-button]',
  template: '<span class="buton--label"><ng-content></ng-content></span>',
  styleUrls: ['./button.styles.scss'],
  host: {
    '(mousedown)': 'onClick($event)',
  },
})

export class ButtonComponent {
  constructor(
    private el: ElementRef,
    private ripple: RippleService,
  ) {}

  @Input() theme: string = 'default';
  @HostBinding('class') get hostClasses(): string {
    return `button--${this.theme}`;
  }
  onClick($event) {
    this.ripple.animate($event);
  }
}
