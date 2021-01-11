import { AccessScope } from '@app/modules/certificates/models/enums/access-scope.enum';
import { CertificateDocumentWithClassifier } from '@app/modules/certificates/models/interfaces/certificate-document';

export interface FinalDocumentDownloadSidebar {
  id: number;
  accessScope: AccessScope;
  accessType: string;
  certificateName: string;
  certificateNumber: string;
  documentName: string;
  documents: CertificateDocumentWithClassifier[];
  generalEducationDocumentType: boolean;
  hasGradeSheet: boolean;
  invalid: boolean;
  withAccess: boolean;
}
