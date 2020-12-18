enum AccessStatus {
  VALID = 'VALID',
  INVALID = 'INVALID'
}

export enum AccessType {
  DISCLOSURE = 'ACCESS_TYPE:DISCLOSURE',
  ACCESS_CODE = 'ACCESS_TYPE:ACCESS_CODE',
  ACCESS_CODE_SINGLE_USE = 'ACCESS_TYPE:ACCESS_CODE_SINGLE_USE',
  ID_CODE = 'ACCESS_TYPE:ID_CODE',
  REG_CODE = 'ACCESS_TYPE:REG_CODE'
}

enum AccessProvider {
  ISSUER = 'ISSUER',
  OWNER = 'OWNER',
  SUPERUSER = 'SUPERUSER'
}

export enum AccessScope {
  MAIN_DOCUMENT = 'ACCESS_SCOPE:MAIN_DOCUMENT',
  WITH_ACCOMPANYING_DOCUMENTS = 'ACCESS_SCOPE:WITH_ACCOMPANYING_DOCUMENTS',
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
