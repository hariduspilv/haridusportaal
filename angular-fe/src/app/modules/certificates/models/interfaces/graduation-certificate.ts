import { GraduationDocumentType } from '../enums/graduation-document-type.enum';
import { CertificateSearchCertificateStatus } from './certificate-document';

export interface GraduationCertificate {
  classStudyGroup: string;
  curriculum: string;
  curriculumName: string;
  id: number;
  issued: string;
  issuerId: string;
  issuerName: string;
  issuerRegCode: string;
  number: string;
  originalNumber: string;
  ownerId: string;
  ownerIdCode: string;
  ownerName: string;
  status: CertificateSearchCertificateStatus;
  type: GraduationDocumentType;
  typeName: string;
}
