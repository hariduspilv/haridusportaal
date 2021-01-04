import {
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'certificate-detailed',
  templateUrl: './certificate-detailed.component.html',
  styleUrls: ['./certificate-detailed.component.scss'],
})
export class CertificateDetailedComponent {

  constructor() {}

  @ViewChild('certificate') certificate: ElementRef;

  @Input() document: any = {};
}
