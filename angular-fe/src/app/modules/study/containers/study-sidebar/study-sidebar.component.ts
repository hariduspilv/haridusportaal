import { Component, Input, OnInit } from '@angular/core';
import { MappedStudyPage } from '../../models/mapped-study-page';
import { MappedStudyPageFieldRightColumn } from '../../models/mapped-study-page-field-right-column';
import { StudyUtility } from '../../study-utility';

@Component({
  selector: 'study-sidebar',
  templateUrl: './study-sidebar.component.html',
  styleUrls: ['./study-sidebar.component.scss'],
})
export class StudySidebarComponent implements OnInit {
  @Input() data: MappedStudyPage;
  public mappedSidebar: MappedStudyPageFieldRightColumn;
  public showStudyDataSidebar: boolean;

  ngOnInit(): void {
    this.mappedSidebar = StudyUtility.mapStudySidebarBlockData(this.data?.fieldRightColumn);
    this.showStudyDataSidebar = this.studyDataSidebarHasValues();
  }

  private studyDataSidebarHasValues(): boolean {
    return !!Object.values(this.mappedSidebar.fieldStudy).find(value => value.length);
  }
}
