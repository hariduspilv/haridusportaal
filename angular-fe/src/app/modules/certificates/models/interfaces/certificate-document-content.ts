import { CertificateLevelOfQualification } from './certificate-level-of-qualification';
import { CouncilDecision } from './council-decision';
import { EducationalInstitution } from './educational-institution';
import { Graduate } from './graduate';
import { HeadOfSchoolDirective } from './head-of-school-directive';
import { Issued } from './issued';
import { PartialQualification } from './partial-qualification';
import { RegisterOfOccupationalQualification } from './register-of-occupational-qualification';
import { Studies } from './studies';

export interface CertificateDocumentContent {
  councilDecision?: CouncilDecision;
  documentName: string;
  duplicateCertificateNumber: null | string;
  duplicateIssueDate: null | string;
  educationalInstitutions?: EducationalInstitution[];
  educationalInstitution?: EducationalInstitution;
  graduate: Graduate;
  issued?: Issued;
  registrationNumber: string;
  levelOfQualification?: CertificateLevelOfQualification;
  studies: Studies;
  headOfSchoolDirective?: HeadOfSchoolDirective;
  partialQualifications?: PartialQualification[];
  registerOfOccupationalQualifications?: RegisterOfOccupationalQualification[];
}
