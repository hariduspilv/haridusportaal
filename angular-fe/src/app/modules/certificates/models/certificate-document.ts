import { ClassifierItemText } from '@app/_core/models/ClassifierItemText';
import { GraduationDocumentType } from './graduation-document-type.enum';

export enum CertificateStatus {
  VALID = 'CERT_DOCUMENT_STATUS:VALID',
  INVALID = 'CERT_DOCUMENT_STATUS:INVALID',
}

export interface CertificateDocument {
  id: string;
  type: GraduationDocumentType;
  typeName: string;
  revision: number;
  language: string;
  status: CertificateStatus;
  number: string;
  content?: JSON;
  extendedContent?: JSON;
  signature_uid?: string;
  metadata?: ClassifierItemText;
  transcript?: any;
}

export interface CertificateDocumentResponse {
  id: number;
  type: string;
  typeName: string;
  revision: number;
  language: string;
  status: string;
  number: string;
}
