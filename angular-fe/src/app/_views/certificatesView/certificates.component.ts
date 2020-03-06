import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  templateUrl: './certificates.template.html',
  styleUrls: ['./certificates.styles.scss'],
})
export class CertificatesView {

  constructor (
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) { }
  public breadcrumbs: any = [
    {
      title: 'Avaleht',
      link: '/',
    },
    {
      title: 'Tunnistused',
    },
    {
      title: 'Lõpudokumendid',
    },
  ];
}
