import { Component, HostBinding, HostListener, Input } from '@angular/core';

@Component({
  selector: '[tag]',
  template: '<ng-content></ng-content>',
  styleUrls: ['./tag.component.scss'],
})

export class TagComponent {
  @HostBinding('attr.active') @Input() active: boolean = false;
}
