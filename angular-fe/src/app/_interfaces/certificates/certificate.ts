import { CertificateDocumentContent } from '@app/_interfaces/certificates/certificate-document-content';
import { Role } from '@app/_interfaces/certificates/role';
import { CertificateIndex } from '@app/_interfaces/certificates/certificate-index';
import { CurrentOwnerData } from '@app/_interfaces/certificates/current-owner-data';

export interface Certificate {
  content: CertificateDocumentContent;
  id: number;
  language: string;
  number: string;
  revision: number;
  status: string;
  type: string;
  typeName: string;
}

export interface CertificateResponse {
  role: Role;
  // SHOULD BE CertificateIndexResponse but too many conflicts with old interfaces
  index: CertificateIndex;
  currentOwnerData: CurrentOwnerData;
}
