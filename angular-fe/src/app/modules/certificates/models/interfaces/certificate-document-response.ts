import { CertificateAction } from './certificate-action';
import { CertificateDocument } from './certificate-document';
import { CertificateIndex } from './certificate-index';

export interface CertificateDocumentResponse {
  actions: CertificateAction[];
  document: CertificateDocument;
  index: CertificateIndex;
}
