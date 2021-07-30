import { Component, Input } from '@angular/core';
import { StudyListIntroContent } from '../../models/study-list-intro';

@Component({
  selector: 'study-intro',
  templateUrl: './study-intro.component.html',
  styleUrls: ['./study-intro.component.scss'],
})
export class StudyIntroComponent {
  @Input() intro: StudyListIntroContent;
}
