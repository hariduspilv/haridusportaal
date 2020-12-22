import { AccessScope } from '@app/modules/certificates/models/certificate-access';
import { CertificateDocumentWithClassifier } from '@app/modules/certificates/models/certificate-document';

export interface FinalDocumentDownloadSidebar {
  id: number;
  accessScope: AccessScope;
  accessType: string;
  certificateName: string;
  certificateNumber: string;
  documents: CertificateDocumentWithClassifier[];
  generalEducationDocumentType: boolean;
  hasGradeSheet: boolean;
  invalid: boolean;
  withAccess: boolean;
}
