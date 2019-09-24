import { Component, Input } from '@angular/core';

@Component({
  selector: 'links',
  templateUrl: 'links.template.html',
  styleUrls: ['links.styles.scss'],
  host: {
    class: 'links',
  },
})

export class LinksComponent {
  @Input() data;
  @Input() type: string = 'external';
}
