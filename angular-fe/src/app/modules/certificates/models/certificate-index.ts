import { CertificateDocument, CertificateDocumentResponse } from './certificate-document';
import { GraduationDocumentType } from './graduation-document-type.enum';
import { JointProgrammeEducationalInstitution } from './joint-programme-educational-institution';

enum CertificateStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
}

export enum TemplateType {
  WITH_COAT_OF_ARMS = 'WITH_COAT_OF_ARMS',
  WITHOUT_COAT_OF_ARMS = 'WITHOUT_COAT_OF_ARMS',
}

export enum DocumentScope {
  MAIN_DOCUMENT = 'MAIN_DOCUMENT',
  WITH_ACCOMPANYING_DOCUMENTS = 'WITH_ACCOMPANYING_DOCUMENTS',
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

export type CertificateTranscriptParams = {
  fileFormat: string;
  TemplateTypes: TemplateType;
  scope?: DocumentScope;
  documentIds?: string[];
  accessorCode?: string;
  accessType?: string;
};
