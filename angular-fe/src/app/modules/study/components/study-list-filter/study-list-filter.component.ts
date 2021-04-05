import { Component, Input } from '@angular/core';
import { MappedStudyFilters } from '../../models/mapped-study-filters';

@Component({
  selector: 'study-list-filter',
  templateUrl: './study-list-filter.component.html',
  styleUrls: ['./study-list-filter.component.scss'],
})
export class StudyListFilterComponent {
  @Input() options: MappedStudyFilters;
  private expanded = false;
  constructor() { }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
  }
}
