import { ClassifierItemsQueryItem } from '@app/modules/classifiers/models/classifier-items-query-item';
import { ClassifierItemText } from '@app/_core/models/ClassifierItemText';
import { CertificateDocumentContent } from './certificate-document-content';
import { GraduationDocumentType } from './graduation-document-type.enum';

export enum CertificateStatus {
  VALID = 'CERT_DOCUMENT_STATUS:VALID',
  INVALID = 'CERT_DOCUMENT_STATUS:INVALID',
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
  metadata: ClassifierItemsQueryItem;
  isMainDocument: boolean;
  isInMainLanguage: boolean;
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
