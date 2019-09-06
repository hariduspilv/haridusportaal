import {
    Component,
    OnInit,
    Input,
  } from '@angular/core';
import FieldVaryService from '@app/_services/FieldVaryService';
@Component({
  selector: 'listItem',
  templateUrl: 'listItem.template.html',
  styleUrls: ['listItem.styles.scss'],
})

  export class ListItemComponent implements OnInit{
  @Input() list;
  @Input() type;

  public objectKeys = Object.keys;

  public footerFields = {
    studyProgramme: [
      'educationalInstitution',
      'duration',
      'teachingLanguage',
    ],
    school: [
      'address',
      'webpage',
      'phone',
      'email',
    ],
  };

  constructor(
  ) {}

  ngOnInit() {
    this.list.forEach((element, index) => {
      this.list[index] = FieldVaryService(element);
    });
  }

  isArray(obj : any) {
    return Array.isArray(obj);
  }
}
