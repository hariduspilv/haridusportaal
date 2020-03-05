import { Component, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'icon',
  templateUrl: 'icon.template.html',
  styleUrls: ['./icon.styles.scss'],
})

export class IconComponent {
  @Input() glyph: string = 'star';
  @Input() size: string = 'default';
  @Input() ariaLabel: string = '';
  @Input() bg: boolean;
  @HostBinding('class') get hostClasses(): string {
    return this.bg ? `${this.size} with-bg` : `${this.size}`;
  }
  @HostBinding('attr.aria-label') get label(): string {
  	return this.ariaLabel;
  }
}
