import {
    Component,
    OnInit,
    Input,
    OnChanges,
  } from '@angular/core';
import FieldVaryService from '@app/_services/FieldVaryService';
@Component({
  selector: 'listItems',
  templateUrl: 'listItem.template.html',
  styleUrls: ['listItem.styles.scss'],
})

  export class ListItemComponent implements OnInit, OnChanges{
  @Input() list: Object[];
  @Input() type: string;

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
    mainProfession: [
      'fillingBar',
    ],
  };

  public competitionLabels = [
    'oska.simple_extended',
    'oska.quite_simple_extended',
    'oska.medium_extended',
    'oska.quite_difficult_extended',
    'oska.difficult_extended',
  ];

  constructor(
  ) {}

  parseList():void {
    this.list.forEach((element, index) => {
      this.list[index] = FieldVaryService(element);
    });
  }
  ngOnInit() {
    this.parseList();
  }

  ngOnChanges() {
    this.parseList();
  }

  getCompetitionLabel (val) {
    if (val > 0 && val < 6) {
      return this.competitionLabels[val - 1];
    }
    return '';
  }

  indicatorValues (item) {
    const res = [];
    let employed = {};
    let pay = {};
    item.forEach((elem) => {
      if (elem.oskaId === 1) employed = elem;
      if (elem.oskaId === 3) pay = elem;
    });
    if (employed['oskaId']) res.push(employed);
    if (pay['oskaId']) res.push(pay);
    return res;
  }

  isArray(obj : any) {
    return Array.isArray(obj);
  }
}
