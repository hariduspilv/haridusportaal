import {
    Component,
    Input,
  } from '@angular/core';
@Component({
  selector: 'studyProgrammes',
  templateUrl: 'studyProgrammes.template.html',
})

  export class StudyProgrammesComponent{
  @Input() list: Object[];
}
