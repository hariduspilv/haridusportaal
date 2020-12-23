import { CertificateTranscriptDocumentScope } from '../enums/certificate-transcript-document-scope.enum';
import { CertificateTranscriptTemplateType } from '../enums/certificate-transcript-template-type.enum';

export type CertificateTranscriptParams = {
  fileFormat: string;
  TemplateTypes: CertificateTranscriptTemplateType;
  scope?: CertificateTranscriptDocumentScope;
  documentIds?: string[];
  accessorCode?: string;
  accessType?: string;
};
