import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MappedStudyFilters } from '../../models/mapped-study-filters';

@Component({
  selector: 'study-list-filter',
  templateUrl: './study-list-filter.component.html',
  styleUrls: ['./study-list-filter.component.scss'],
})
export class StudyListFilterComponent implements OnInit {
  @Input() options: MappedStudyFilters;
  private filtersOfExpandedState: string[] = [
    'alates',
    'kuni',
    'publikatsiooniKeel',
    'publikatsiooniLiik',
    'sildid',
    'valjaandja',
  ];
  private expanded = false;

  constructor(private route: ActivatedRoute) {}

  toggleExpanded(): void {
    this.expanded = !this.expanded;
  }

  filtersExistInExpandableBlock(): boolean {
    return !!Object.keys(this.route.snapshot.queryParams)
      .find((parameter: string) => this.filtersOfExpandedState.includes(parameter));
  }

  ngOnInit(): void {
    this.expanded = this.filtersExistInExpandableBlock();
  }
}
