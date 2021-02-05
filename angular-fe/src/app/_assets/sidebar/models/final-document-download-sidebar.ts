import { AccessScope } from '@app/modules/certificates/models/enums/access-scope.enum';
import { CertificateDocumentWithClassifier } from '@app/modules/certificates/models/interfaces/certificate-document';
import { CertificateOwner } from './certificate-owner';

export interface FinalDocumentDownloadSidebar {
  id?: number;
  accessScope?: AccessScope;
  accessType?: string;
  certificateOwner?: CertificateOwner;
  certificateNumber?: string;
  documentName?: string;
  documents?: CertificateDocumentWithClassifier[];
  generalEducationDocumentType?: boolean;
  hasGradeSheet?: boolean;
  invalid?: boolean;
  withAccess?: boolean;
  currentOwnerData?: CertificateOwner;
}

export interface FinalDocumentHistorySidebar {
  issuerInstitution?: string;
  generalEducationDocumentType?: boolean;
  accessType?: string;
  accessScope?: string;
  certificateOwner?: CertificateOwner;
  currentOwnerData?: CertificateOwner;
}
