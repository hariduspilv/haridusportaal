import { Component, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'labeled-separator',
  templateUrl: './labeled.separator.template.html',
  styleUrls: ['./labeled.separator.styles.scss'],
})

export class LabeledSeparatorComponent {
  @Input() label: string;
  @Input() type: string;
  @HostBinding('attr.aria-hidden') ariaHidden:boolean = true;
  @HostBinding('class') get hostClasses(): string {
    return `${this.type}`;
  }
}
