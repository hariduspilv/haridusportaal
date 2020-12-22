import { AccessScope } from '../enums/access-scope.enum';

export interface Role {
  base: string;
  accessScope: AccessScope;
}
