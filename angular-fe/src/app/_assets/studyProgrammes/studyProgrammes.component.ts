import {
    Component,
    OnInit,
    Input,
  } from '@angular/core';
@Component({
  selector: 'studyProgrammes',
  templateUrl: 'studyProgrammes.template.html',
})

  export class StudyProgrammesComponent implements OnInit{
  @Input() list: Object[];

  public objectKeys = Object.keys;

  constructor(
  ) {}

  ngOnInit() {
  }
}
