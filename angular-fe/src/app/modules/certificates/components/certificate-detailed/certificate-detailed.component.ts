import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CertificatesUtility } from '../../certificates.utility';

@Component({
  selector: 'certificate-detailed',
  templateUrl: './certificate-detailed.component.html',
  styleUrls: ['./certificate-detailed.component.scss'],
})
export class CertificateDetailedComponent {

  @ViewChild('certificate') certificate: ElementRef;

  @Input() document: any = {};

  get eduInst(): string {
    return CertificatesUtility.getEducationalInstitutions(this.document);
  }
}
