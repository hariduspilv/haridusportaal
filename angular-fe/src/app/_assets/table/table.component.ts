import { Component, Input, OnInit } from '@angular/core';
import { parseData } from './studyProgramme.parser';
@Component({
  selector: 'school-table',
  templateUrl: 'table.school.template.html',
})

export class SchoolTable {
  @Input() data;
}

@Component({
  selector: 'studyProgramme-table',
  templateUrl: 'table.studyProgramme.html',
})

export class StudyProgrammeTable implements OnInit{
  @Input() data;
  public table;
  ngOnInit() {
    this.table = parseData(this.data);
  }
}

@Component({
  selector: '[htm-table]',
  templateUrl: 'table.template.html',
  styleUrls: ['./table.styles.scss'],
})

export class TableComponent {
}
