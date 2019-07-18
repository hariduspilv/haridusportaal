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

  }
}
