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

  ngOnInit() {

    console.log(this.document)

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
