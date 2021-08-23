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

  private idCode(idCode: string): string {
    if (!idCode || !isNaN(<any>idCode.charAt(0)) && !isNaN(<any>idCode.charAt(1))) {
      return idCode;
    }
    return idCode.substring(2);
  }

  public get isNewFirstName(): boolean {
    const { content } = this.documents.certificate;
    return content.currentOwnerData &&
      content.currentOwnerData.firstName.toLowerCase() !==
      content.graduate.firstName.toLowerCase()
  }

  public get isNewLastName(): boolean {
    const { content } = this.documents.certificate;
    return content.currentOwnerData &&
      content.currentOwnerData.lastName.toLowerCase() !==
      content.graduate.lastName.toLowerCase()
  }

  public get isNewIDCode(): boolean {
    const { content } = this.documents.certificate;
    return content.currentOwnerData &&
      this.idCode(content.currentOwnerData.idCode) !==
      this.idCode(content.graduate.idCode)
  }

  public get certificate(): CertificateDocument {
    console.log(this.documents)
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
