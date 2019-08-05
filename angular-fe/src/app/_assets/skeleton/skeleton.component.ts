import { Component, Input } from '@angular/core';

@Component({
  selector: 'skeleton',
  templateUrl: './skeleton.template.html',
  styleUrls: ['./skeleton.styles.scss'],
})

export class SkeletonComponent {
  @Input() type: string = 'line';
}
