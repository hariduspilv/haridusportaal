import { Certificate, CertificateResponse } from './certificate';
import { CertificateAccessDTO } from './certificate-access-dto';
import { CertificateAction } from './certificate-action';
import { CertificateActionResponse } from './certificate-action-response';
import { CertificateDataIssueResponse } from './certificate-data-issue-response';
import { CertificateDocument } from './certificate-document';
import { CertificateIndex } from './certificate-index';
import { CurrentOwnerData } from './current-owner-data';
import { Role } from './role';

export interface CertificateData {
  index: CertificateIndex;
  certificate: Certificate;
  actions: CertificateAction[];
  documents: CertificateDocument[];
  currentOwnerData: CurrentOwnerData;
  role: Role;
}

export interface FormattedCertificateDataResponse {
  certificate: CertificateResponse;
  certificateAccessInvalid: CertificateAccessDTO;
  certificateAccessValid: CertificateAccessDTO;
  certificateActions: CertificateActionResponse;
  certificateIssues: CertificateDataIssueResponse[];
}
