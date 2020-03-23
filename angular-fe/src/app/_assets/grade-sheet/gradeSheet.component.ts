import { Component, Input } from '@angular/core';

@Component({
  selector: 'grade-sheet',
  templateUrl: 'gradeSheet.template.html',
  styleUrls: ['gradeSheet.styles.scss'],
})
export class GradeSheetComponent{

  @Input() public document: any = {};

  public mandatorySubjects = [];
  public electives = [];
  public hasSchoolExam = false;
  public hasIndividualProgramme = false;
  public toimetulekuOpe = false;

  public ngOnInit() {

    if (this.document.content.studies.curriculumCode === '1010109'
    || this.document.content.studies.curriculumCode === '1010107') {
      this.toimetulekuOpe = true;
    }

    /*if (this.document.content.studies.curriculumName ===
      'põhikooli lihtsustatud riiklik õppekava toimetulekuõpe'
    || this.document.content.studies.curriculumName ===
    'põhikooli lihtsustatud riiklik õppekava hooldusõpe') {
      this.toimetulekuOpe = true;
    }*/

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
