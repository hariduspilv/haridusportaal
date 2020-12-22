import { AccessScope } from './certificate-access';

export interface Role {
  base: string;
  accessScope: AccessScope;
}
