import { Component } from '@angular/core';

@Component({
  selector: 'certificates-container',
  templateUrl: './certificates-container.component.html',
  styleUrls: ['./certificates-container.component.scss'],
})
export class CertificatesContainerComponent {

  public breadcrumbs: any = [
    {
      title: 'frontpage.label',
      link: '/',
    },
    {
      title: 'certificates.title',
    },
    {
      title: 'certificates.final_documents',
    },
  ];

}
