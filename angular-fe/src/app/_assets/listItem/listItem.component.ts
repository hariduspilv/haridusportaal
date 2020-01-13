import {
    Component,
    OnInit,
    Input,
    OnChanges,
  } from '@angular/core';
import FieldVaryService from '@app/_services/FieldVaryService';
import { ModalService, AlertsService } from '@app/_services';
import { translationsPerType } from '../compare/helpers/compare';
@Component({
  selector: 'listItems',
  templateUrl: 'listItem.template.html',
  styleUrls: ['listItem.styles.scss'],
})

export class ListItemComponent implements OnInit, OnChanges{
  @Input() list: Object[];
  @Input() type: string;
  @Input() compare: string;
  @Input() addonClass: string = '';

  public closeTime: number = 5000;
  private translationsPerType = translationsPerType;
  public clickedVideos = {};
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
    homeSearch: [
      'fieldSchoolName',
      'studyProgrammeLevel',
      'duration',
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
    private modalService: ModalService,
    private alertsService: AlertsService,
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

  returnEntityString (entity) {
    if (Array.isArray(entity)) {
      const values = entity.map(val => val.entity.entityLabel);
      return values.join(', ');
    }
    return entity;
  }

  isArray(obj : any) {
    return Array.isArray(obj);
  }
}
