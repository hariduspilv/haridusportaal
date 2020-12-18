import { CertificateAccess } from '@app/_interfaces/certificates/certificate-access';

export interface CertificateDataIssueResponse {
  address: string;
  certificateAccess?: CertificateAccess;
  id: number;
  issueBase: string;
  issueTime: string;
  issueType: string;
}
