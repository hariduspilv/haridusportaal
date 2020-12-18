import { EducationalInstitution } from '@app/_interfaces/certificates/educational-institution';
import { Graduate } from '@app/_interfaces/certificates/graduate';
import { Issued } from '@app/_interfaces/certificates/issued';
import { Studies } from '@app/_interfaces/certificates/studies';
import { HeadOfSchoolDirective } from '@app/_interfaces/certificates/head-of-school-directive';
import { PartialQualification } from '@app/_interfaces/certificates/partial-qualification';
import { RegisterOfOccupationalQualification } from '@app/_interfaces/certificates/register-of-occupational-qualification';
import { CouncilDecision } from '@app/_interfaces/certificates/council-decision';
import { CertificateLevelOfQualification } from '@app/_interfaces/certificates/certificate-level-of-qualification';

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
