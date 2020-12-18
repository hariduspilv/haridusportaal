import { GraduationDocumentType } from '@app/_enums/certificates/graduation-document-type.enum';
import { JointProgrammeEducationalInstitution } from '@app/_interfaces/certificates/joint-programme-educational-institution';
import { CertificateDocument, CertificateDocumentNew } from './certificate-document';

enum CertificateStatus {
  VALID = 'VALID',
  INVALID = 'INVALID'
}

export interface CertificateIndex {
  id: number;
  validFrom: string;
  validUntil: string;
  classStudyGroup: string;
  number: string;
  originalNumber: string;
  ownerId: string;
  ownerIdCode: string;
  ownerName: string;
  ownerDateOfBirth: string;
  status: CertificateStatus;
  type: GraduationDocumentType;
  typeName: string;
  issued: string;
  issuerId: string;
  issuerName: string;
  issuerRegCode: string;
  curriculum: string;
  curriculumName: string;
  documents?: CertificateDocument[];
  qualificationWithinCurrentFramework?: string;
  jointProgrammeEducationalInstitutions: JointProgrammeEducationalInstitution[];
}

export interface CertificateIndexResponse {
  id: number;
  validFrom: string;
  validUntil: string;
  classStudyGroup: string;
  number: string;
  originalNumber: string;
  ownerId: string;
  ownerIdCode: string;
  ownerName: string;
  ownerDateOfBirth: string;
  status: CertificateStatus;
  type: GraduationDocumentType;
  typeName: string;
  issued: string;
  issuerId: string;
  issuerName: string;
  issuerRegCode: string;
  curriculum: string;
  curriculumName: string;
  documents: CertificateDocumentNew[];
  jointProgrammeEducationalInstitutions: JointProgrammeEducationalInstitution;
}
