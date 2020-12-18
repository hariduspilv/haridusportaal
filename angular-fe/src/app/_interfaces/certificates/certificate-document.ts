import { GraduationDocumentType } from '@app/_enums/certificates/graduation-document-type.enum';
import { ClassifierItemText } from '@app/_interfaces/classifiers/ClassifierItemText';
import { CertificateDocumentContent } from './certificate-document-content';

export enum CertificateStatus {
  VALID = 'CERT_DOCUMENT_STATUS:VALID',
  INVALID = 'CERT_DOCUMENT_STATUS:INVALID'
}

export interface CertificateDocument {
  id: number;
  type: GraduationDocumentType;
  typeName: string;
  number: string;
  status: CertificateStatus;
  revision: string;
  content?: string | CertificateDocumentContent;
  extendedContent?: JSON;
  language: string;
  signature_uid?: string;
  transcript?: any;
}
export interface CertificateDocumentWithClassifier extends CertificateDocument {
  metadata: ClassifierItemText;
}

export interface FormattedCertificateDocumentData {
  certificate: CertificateDocument;
  transcript: CertificateDocument;
  supplement: CertificateDocument;
}

export interface CertificateDocumentNew {
  id: number;
  type: string;
  typeName: string;
  revision: number;
  language: string;
  status: string;
  number: string;
}
