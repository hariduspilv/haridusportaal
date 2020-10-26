import { Component, Input } from '@angular/core';

@Component({
  selector: 'label-count',
  templateUrl: './label-count.component.html',
  styleUrls: ['./label-count.component.scss'],
})
export class LabelCountComponent {
  @Input() count: number;
}
