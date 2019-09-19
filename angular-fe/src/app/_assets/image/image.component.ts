import { Component, Input } from '@angular/core';

@Component({
  selector: 'image',
  templateUrl: 'image.template.html',
  styleUrls: ['image.styles.scss'],
  host: {
    class: 'image',
  },
})

export class ImageComponent {
  @Input() image: [] = [];
}
