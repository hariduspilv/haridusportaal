import {
    Component,
    OnInit,
    Input,
  } from '@angular/core';
import { FieldVaryService, ModalService } from '@app/_services';
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

  public listItemTypes = [
    'school',
    'studyProgramme',
  ];

  public listItemId;

  constructor(
    public fieldVaryService: FieldVaryService,
    public modalService: ModalService) {}

  ngOnInit() {
      this.list = this.fieldVaryService.cleanDataArray(this.list);
  }

  isArray(obj : any) {
    return Array.isArray(obj);
  }
}
