import { FinalDocumentDownloadSidebar, FinalDocumentHistorySidebar } from '@app/_assets/sidebar/models/final-document-download-sidebar';
import { CertificateDocument } from './certificate-document';

interface CertificateFinalDocumentDashboardSidebarEntity {
  finalDocumentDownload: FinalDocumentDownloadSidebar;
  finalDocumentHistory: FinalDocumentHistorySidebar;
  finalDocumentAccess: {
    issuerInstitution?: string
    certificate?: CertificateDocument;
  };
}

export interface CertificateFinalDocumentDashboardSidebar {
  entity: CertificateFinalDocumentDashboardSidebarEntity;
}
