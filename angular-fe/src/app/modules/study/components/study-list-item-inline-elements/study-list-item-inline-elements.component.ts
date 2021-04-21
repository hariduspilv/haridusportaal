import { Component, Input } from '@angular/core';

@Component({
  selector: 'study-list-item-inline-elements',
  templateUrl: './study-list-item-inline-elements.component.html',
  styleUrls: ['./study-list-item-inline-elements.component.scss'],
})
export class StudyListItemInlineElementsComponent {
  @Input() inlineFields: string[];
}
