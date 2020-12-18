import { Certificate, CertificateResponse } from '@app/_interfaces/certificates/certificate';
import { CurrentOwnerData } from '@app/_interfaces/certificates/current-owner-data';
import { CertificateActionResponse } from '@app/_interfaces/certificates/certificate-action-response';
import { CertificateIndex } from './certificate-index';
import { CertificateAction } from './certificate-action';
import { CertificateDocument } from './certificate-document';

export interface CertificateData {
  index: CertificateIndex;
  certificate: Certificate;
  actions: CertificateAction[];
  documents: CertificateDocument[];
  currentOwnerData: CurrentOwnerData;
}

export interface FormattedCertificateDataResponse {
  certificate: CertificateResponse;
  certificateActions: CertificateActionResponse;
}
