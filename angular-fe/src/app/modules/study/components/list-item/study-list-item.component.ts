import { Component, Input } from '@angular/core';
import { Study } from '../../models/study';

@Component({
  selector: 'study-list-item',
  templateUrl: './study-list-item.component.html',
  styleUrls: ['./study-list-item.component.scss'],
})
export class StudyListItemComponent {
  @Input() study: Study;
  @Input() highlighted: boolean;
  @Input() noBorderBefore: boolean;
}
