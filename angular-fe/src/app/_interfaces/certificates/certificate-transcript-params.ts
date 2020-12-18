import { CertificateTranscriptDocumentScope } from '@app/_enums/certificates/certificate-transcript-document-scope.enum';
import { CertificateTranscriptTemplateType } from '@app/_enums/certificates/certificate-transcript-template-type.enum';

export type CertificateTranscriptParams = {
  fileFormat: string;
  TemplateTypes: CertificateTranscriptTemplateType;
  scope?: CertificateTranscriptDocumentScope;
  documentIds?: string[];
  accessorCode?: string;
  accessType?: string;
};
