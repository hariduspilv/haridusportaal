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
  public hasGradedExaminations = false;
  public hasResultantExaminations = false;
  public toimetulekuOpe = false;
  public isGeneralEducation = false;
  public resultColspan = 1;

  public ngOnInit(): void {

    if (this.document.content?.studies?.curriculumCode === 'OPPEKAVA:1010109'
    || this.document.content?.studies?.curriculumCode === 'OPPEKAVA:1010107') {
      this.toimetulekuOpe = true;
    }

    this.mandatorySubjects =
      this.document.content?.studySubjects?.filter((subject) => subject.type === 'kohustuslik');

    this.electives =
      this.document.content?.studySubjects?.filter((subject) => subject.type === 'valikaine');

    this.hasIndividualProgramme = this.document.content?.studySubjects?.some(
      (subject) => subject.studyProgrammeType === 'individuaalne õppekava',
    );

    this.hasSchoolExam = this.document.content?.graduationExaminations?.some(
      (exam) => exam.type === 'koolieksam',
    );

    this.hasGradedExaminations = this.document.content?.graduationExaminations?.some(
      (exam) => exam.resultNumeric != null,
    );

    this.hasResultantExaminations = this.document.content?.graduationExaminations?.some(
      (exam) => exam.resultProcent != null,
    );

    this.isGeneralEducation = this.document.type === 'GRADUATION_DOCUMENT_TYPE:GENERAL_EDUCATION_TRANSCRIPT_OF_GRADES';
    this.resultColspan = (!this.hasGradedExaminations || (this.hasGradedExaminations && !this.hasResultantExaminations))
      && this.isGeneralEducation ? 2 : 1;
  }
}
