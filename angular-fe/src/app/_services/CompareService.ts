import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CompareService {

  constructor(
    private http: HttpClient,
  ) {}

  // StudyProgrammes
  public existingFields: String[] = [];

  // OskaProfessions
  public list: any = false;
  public fixedLabelExists: boolean = false;
  public oskaFields: any = {};
  public oskaFieldsMaxLength: number = 0;
  public progressFields: String[] = [];
  public employedFields: String[] = [];
  public employedChangeFields: String[] = [];
  public paymentFields: String[] = [];
  public graduatesToJobsFields: String[] = [];
  public oskaFieldsArr: Number[] = [];
  public finalFields: String[] = [];
  public finalFieldsArr: Number[] = [];
  public competitionLabel: String[] = [];

  public competitionLabels = [
    'oska.simple',
    'oska.quite_simple',
    'oska.medium',
    'oska.quite_difficult',
    'oska.difficult',
  ];

  public graduatesToJobsValues = [
    { class: 'first with-bg', text: 'oska.more_graduates' },
    { class: 'first with-bg', text: 'oska.less_graduates' },
    { class: 'second with-bg', text: 'oska.enough_graduates' },
    { class: 'third with-bg', text: 'oska.graduates_work_outside_field' },
    { class: 'fourth with-bg', text: 'oska.no_graduates' },
  ];
  public trendingValues = [
    { icon: 'arrow-up', class: 'second', text: 'oska.big_increase' },
    { icon: 'arrow-up-right', class: 'second', text: 'oska.increase' },
    { icon: 'arrow-right', class: 'third', text: 'oska.stagnant' },
    { icon: 'arrow-down-right', class: 'first', text: 'oska.decline' },
    { icon: 'arrow-down', class: 'first', text: 'oska.big_decline' },
  ];

  resetValues() {
    this.oskaFields = {};
    this.finalFields = [];
    this.oskaFieldsMaxLength = 0;
    this.oskaFieldsArr = [];
    this.finalFieldsArr = [];
    this.progressFields = [];
    this.employedFields = [];
    this.employedChangeFields = [];
    this.paymentFields = [];
    this.graduatesToJobsFields = [];
    this.competitionLabel = [];
  }

  formatData(data, compare, key) {
    switch (key) {
      case 'oskaProfessionsComparison':
        this.resetValues();
        const prosFields = {};
        let prosFieldsMaxLength = 0;
        const neutralFields = {};
        let neutralFieldsMaxLength = 0;
        const consFields = {};
        let consFieldsMaxLength = 0;
        data.sort((a, b) =>
          compare.indexOf(a.nid) - compare.indexOf(b.nid)).forEach((elem, index) => {
            if (elem.fieldFixedLabel) {
              this.fixedLabelExists = true;
            }
            if (elem.fieldSidebar) {
              elem.fieldSidebar.entity.fieldOskaField.forEach((oska, indexVal) => {
                if (oska.entity) {
                  this.oskaFields[index] = this.oskaFields[index] ?
                    [...this.oskaFields[index], oska] : [oska];
                  if (this.oskaFieldsMaxLength < indexVal + 1) {
                    this.oskaFieldsMaxLength = indexVal + 1;
                  }
                }
              });
            }
            if (elem.reverseOskaMainProfessionOskaIndicatorEntity
              && elem.reverseOskaMainProfessionOskaIndicatorEntity.entities.length) {
              const claimed = { 0: false, 1: false, 2: false, 3: false };
              elem.reverseOskaMainProfessionOskaIndicatorEntity.entities.forEach((term, index) => {
                if (term.oskaId && term.oskaId === 1 && term.value) {
                  this.employedFields.push(term.value);
                  claimed[term.oskaId - 1] = true;
                }
                if (term.oskaId && term.oskaId === 2 && term.icon) {
                  this.employedChangeFields.push(term.icon);
                  claimed[term.oskaId - 1] = true;
                }
                if (term.oskaId && term.oskaId === 3) {
                  this.paymentFields.push(term.value);
                  claimed[term.oskaId - 1] = true;
                }
                if (term.oskaId && term.oskaId === 4) {
                  this.graduatesToJobsFields.push(term.icon);
                  claimed[term.oskaId - 1] = true;
                }
              });
              if (!claimed[0]) {
                this.employedFields.push('');
              }
              if (!claimed[1]) {
                this.employedChangeFields.push('');
              }
              if (!claimed[2]) {
                this.paymentFields.push('');
              }
              if (!claimed[3]) {
                this.graduatesToJobsFields.push('');
              }
            } else {
              this.employedFields.push('');
              this.employedChangeFields.push('');
              this.paymentFields.push('');
              this.graduatesToJobsFields.push('');
            }
            if (elem.reverseOskaMainProfessionOskaFillingBarEntity
              && elem.reverseOskaMainProfessionOskaFillingBarEntity.entities.length
              && elem.reverseOskaMainProfessionOskaFillingBarEntity.entities[0]
              && elem.reverseOskaMainProfessionOskaFillingBarEntity.entities[0].value
              && elem.reverseOskaMainProfessionOskaFillingBarEntity.entities[0].value > 0
              && elem.reverseOskaMainProfessionOskaFillingBarEntity.entities[0].value < 6) {
              const varVal =
                elem.reverseOskaMainProfessionOskaFillingBarEntity.entities[0].value;
              this.progressFields.push(varVal);
              this.competitionLabel.push(this.competitionLabels[varVal - 1]);
            } else {
              this.progressFields.push('');
              this.competitionLabel.push('');
            }
            if (elem.fieldSidebar
              && elem.fieldSidebar.entity.fieldPros
              && elem.fieldSidebar.entity.fieldPros.length) {
              elem.fieldSidebar.entity.fieldPros.forEach((pro, ind) => {
                prosFields[index] = prosFields[index]
                  ? [...prosFields[index], { value: pro, type: 'pro' }]
                  : [{ value: pro, type: 'pro' }];
                if (prosFieldsMaxLength < ind + 1) { prosFieldsMaxLength = ind + 1; }
              });
            }
            if (elem.fieldSidebar
              && elem.fieldSidebar.entity.fieldNeutral
              && elem.fieldSidebar.entity.fieldNeutral.length) {
              elem.fieldSidebar.entity.fieldNeutral.forEach((neutral, ind) => {
                neutralFields[index] = neutralFields[index]
                  ? [...neutralFields[index], { value: neutral, type: 'neutral' }]
                  : [{ value: neutral, type: 'neutral' }];
                if (neutralFieldsMaxLength < ind + 1) { neutralFieldsMaxLength = ind + 1; }
              });
            }
            if (elem.fieldSidebar
              && elem.fieldSidebar.entity.fieldCons
              && elem.fieldSidebar.entity.fieldCons.length) {
              elem.fieldSidebar.entity.fieldCons.forEach((con, ind) => {
                consFields[index] = consFields[index]
                ? [...consFields[index], { value: con, type: 'con' }]
                : [{ value: con, type: 'con' }];
                if (consFieldsMaxLength < ind + 1) {
                  consFieldsMaxLength = ind + 1;
                }
              });
            }
          });
        if (this.progressFields.every(this.isEmptyString)) {
          this.progressFields = [];
        }
        if (this.employedFields.every(this.isEmptyString)) {
          this.employedFields = [];
        }
        if (this.employedChangeFields.every(this.isEmptyString)) {
          this.employedChangeFields = [];
        }
        if (this.paymentFields.every(this.isEmptyString)) {
          this.paymentFields = [];
        }
        if (this.graduatesToJobsFields.every(this.isEmptyString)) {
          this.graduatesToJobsFields = [];
        }
        const finalFields = [];
        data.forEach((e, index) => {
          const pros = prosFields[index] || [];
          const neutrals = neutralFields[index] || [];
          const cons = consFields[index] || [];
          finalFields.push([...pros, ...neutrals, ...cons]);
        });
        this.finalFields = finalFields;
        const finalArrLength = prosFieldsMaxLength + neutralFieldsMaxLength + consFieldsMaxLength;
        this.finalFieldsArr = finalArrLength
          ? Array(finalArrLength - 1).fill(0).map((x, i) => i) : [];
        this.oskaFieldsArr = this.oskaFieldsMaxLength
          ? Array(this.oskaFieldsMaxLength).fill(0).map((x, i) => i) : [];
        this.list = data;
        break;
      case 'studyProgrammeComparison':
        this.existingFields = [];
        this.list = data;
        const fieldsToCheck = [
          'EducationalInstitution',
          'level',
          'degreeOrDiplomaAwarded',
          'specialization',
          'teachingLanguage',
          'fieldAmount',
          'practicalTrainingAmount',
          'duration',
          'admissionStatus',
        ];
        fieldsToCheck.forEach((item) => {
          if (this.list.find((elem) => {
            return elem[item] !== null;
          })) {
            this.existingFields.push(item);
          }
        });
        break;
      default:
        this.list = data;
        break;
    }
  }
  isEmptyString(element, index, array) {
    return element === '';
  }
}
