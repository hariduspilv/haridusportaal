import { Component, Input } from '@angular/core';

@Component({
  selector: 'icon',
  templateUrl: 'icon.template.html',
  styleUrls: ['./icon.styles.scss'],
})

export class IconComponent {
  @Input() glyph: string = 'star';
  @Input() size: string = 'default';
}
