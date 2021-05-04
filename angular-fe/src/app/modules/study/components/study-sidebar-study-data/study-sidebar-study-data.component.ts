import { Component, Input } from '@angular/core';
import { MappedStudyPageFieldRightColumnStudyData } from '../../models/mapped-study-page-field-right-column-study-data';

@Component({
  selector: 'study-sidebar-study-data',
  templateUrl: './study-sidebar-study-data.component.html',
  styleUrls: ['./study-sidebar-study-data.component.scss'],
})
export class StudySidebarStudyDataComponent {
  @Input() data: MappedStudyPageFieldRightColumnStudyData;
}
