import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: './certificates.template.html',
  styleUrls: ['./certificates.styles.scss'],
})
export class CertificatesView implements OnInit {

  constructor(
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

  ngOnInit() {
  }

}
