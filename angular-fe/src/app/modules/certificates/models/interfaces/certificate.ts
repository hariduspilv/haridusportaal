import { Content } from '@angular/compiler/src/render3/r3_ast';
import { CertificateIndex } from './certificate-index';
import { CurrentOwnerData } from './current-owner-data';
import { Role } from './role';

export interface Certificate {
  content: Content;
  id: number;
  language: string;
  number: string;
  revision: number;
  status: string;
  type: string;
  typeName: string;
}

export interface CertificateResponse {
  role: Role;
  // SHOULD BE CertificateIndexResponse but too many conflicts with old interfaces
  index: CertificateIndex;
  currentOwnerData: CurrentOwnerData;
}
