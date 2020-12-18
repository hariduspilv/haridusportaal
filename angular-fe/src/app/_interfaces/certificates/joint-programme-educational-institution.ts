import { JointProgrammeRole } from '@app/_enums/certificates/joint-programme-role-classifier.enum';

export interface JointProgrammeEducationalInstitution {
  role: JointProgrammeRole;
  educationalInstitutionUID: string;
  name: string;
  educationalInstitutionRegCode: string;
}
