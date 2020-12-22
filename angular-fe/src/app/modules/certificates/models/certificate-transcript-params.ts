import { CertificateTranscriptDocumentScope } from './certificate-transcript-document-scope.enum';
import { CertificateTranscriptTemplateType } from './certificate-transcript-template-type.enum';

export type CertificateTranscriptParams = {
  fileFormat: string;
  TemplateTypes: CertificateTranscriptTemplateType;
  scope?: CertificateTranscriptDocumentScope;
  documentIds?: string[];
  accessorCode?: string;
  accessType?: string;
};
