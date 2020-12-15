import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'certificate-grade-sheet',
  templateUrl: './certificate-grade-sheet.component.html',
  styleUrls: ['./certificate-grade-sheet.component.scss'],
})
export class CertificateGradeSheetComponent implements OnInit {

  @Input() public document: any = {};

  public mandatorySubjects = [];
  public electives = [];
  public hasSchoolExam = false;
  public hasIndividualProgramme = false;
  public toimetulekuOpe = false;

  public ngOnInit() {

    if (this.document.content.studies.curriculumCode === 'OPPEKAVA:1010109'
    || this.document.content.studies.curriculumCode === 'OPPEKAVA:1010107') {
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
