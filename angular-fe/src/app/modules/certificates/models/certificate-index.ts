import { CertificateDocument } from './certificate-document';
import { CertificateDocumentResponse } from './certificate-document-response';
import { GraduationDocumentType } from './graduation-document-type.enum';
import { JointProgrammeEducationalInstitution } from './joint-programme-educational-institution';

enum CertificateStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
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
  documents: CertificateDocumentResponse[];
  jointProgrammeEducationalInstitutions: JointProgrammeEducationalInstitution;
}
