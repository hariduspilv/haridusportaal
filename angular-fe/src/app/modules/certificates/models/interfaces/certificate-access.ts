import { AccessScope } from '../enums/access-scope.enum';
import { AccessType } from '../enums/access-type.enum';

enum AccessStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
}

enum AccessProvider {
  ISSUER = 'ISSUER',
  OWNER = 'OWNER',
  SUPERUSER = 'SUPERUSER',
}

export interface CertificateAccess {
  type: AccessType;
  scope: AccessScope;
  status?: AccessStatus;
  id?: string;
  issued?: string;
  endDate?: string;
  accessorCode?: string;
  emailAddress?: string;
  accessProvider?: AccessProvider;
}
