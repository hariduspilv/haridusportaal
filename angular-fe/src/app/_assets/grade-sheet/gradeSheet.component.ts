import { Component, Input, HostBinding, ElementRef, HostListener, ViewChild, SimpleChanges, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'grade-sheet',
  templateUrl: 'gradeSheet.template.html',
  styleUrls: ['gradeSheet.styles.scss'],
})
export class GradeSheetComponent{

  constructor (
  ) {}

  @Input() document: any = {};

  public mandatorySubjects = [];
  public electives = [];
  public hasSchoolExam = false;
  public hasIndividualProgramme = false;
  public toimetulekuOpe = false;

  public changed = false;

  change() {
    this.changed = true;
  }

  ngOnInit() {

    if (this.document.content.studies.curriculumName ===
      'põhikooli lihtsustatud riiklik õppekava toimetulekuõpe'
    || this.document.content.studies.curriculumName ===
    'põhikooli lihtsustatud riiklik õppekava hooldusõpe') {
      this.toimetulekuOpe = true;
    }

    this.mandatorySubjects =
      this.document.content.studySubjects.filter((subject) => {
        return subject.type === 'kohustuslik';
      });

    this.electives =
      this.document.content.studySubjects.filter((subject) => {
        return subject.type === 'valikaine';
      });

    this.hasIndividualProgramme = this.document.content.studySubjects.some((subject) => {
      return subject.studyProgrammeType === 'individuaalne õppekava';
    });

    this.hasSchoolExam = this.document.content.graduationExaminations.some((exam) => {
      return exam.type === 'koolieksam';
    });
  }
}
