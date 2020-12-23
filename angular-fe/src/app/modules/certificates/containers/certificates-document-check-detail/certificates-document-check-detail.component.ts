import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'certificates-document-check-detail',
  templateUrl: './certificates-document-check-detail.component.html',
  styleUrls: ['./certificates-document-check-detail.component.scss'],
})
export class CertificatesDocumentCheckDetailComponent {
  public path = this.location.path();
  constructor(
    private location: Location,
  ) { }
}
