import {
  Component,
  Input,
} from '@angular/core';
import { CertificatesUtility } from '../../certificates.utility';
import { CertificateDocument } from '../../models/interfaces/certificate-document';

@Component({
  selector: 'certificate-detailed',
  templateUrl: './certificate-detailed.component.html',
  styleUrls: ['./certificate-detailed.component.scss'],
})
export class CertificateDetailedComponent {

  @Input() documents: any = {};

  public get certificate(): CertificateDocument {
    return this.documents.certificate;
  }

  public get transcript(): CertificateDocument {
    return this.documents.transcript;
  }

  public get supplement(): CertificateDocument {
    return this.documents.supplement;
  }

  public get eduInst(): string {
    return CertificatesUtility.getEducationalInstitutions(this.certificate);
  }

  public get issueDate(): string {
    return CertificatesUtility.getCertificateIssueDate(this.certificate);
  }
}
