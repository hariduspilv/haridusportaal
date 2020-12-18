import { CertificateDocument } from '@app/_interfaces/certificates/certificate-document';

enum ActionType {
  ISSUING = 'ISSUING',
  ISSUING_DUPLICATE = 'ISSUING_DUPLICATE',
  REPEALING = 'REPEALING',
}

enum ActionStatus {
  CONFIRMED = 'CONFIRMED'
}

export interface CertificateAction {
  id: string;
  type: ActionType;
  status: ActionStatus;
  added: string;
  approved: string;
  decisionNumber: string;
  document?: CertificateDocument;
  dateOfDecision: string;
  reason: string;
  explanation: string;
  notificationEmail: string;
}
