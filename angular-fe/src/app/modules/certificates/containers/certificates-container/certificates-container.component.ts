import { Component } from '@angular/core';

@Component({
  selector: 'certificates-container',
  templateUrl: './certificates-container.component.html',
  styleUrls: ['./certificates-container.component.scss'],
})
export class CertificatesContainerComponent {

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
