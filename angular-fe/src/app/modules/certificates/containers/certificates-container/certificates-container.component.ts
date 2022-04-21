import { Component, OnInit } from '@angular/core';
import { SettingsService } from "@app/_services";

@Component({
  selector: 'certificates-container',
  templateUrl: './certificates-container.component.html',
  styleUrls: ['./certificates-container.component.scss'],
})
export class CertificatesContainerComponent implements OnInit {

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

	constructor(private settings: SettingsService) { }

	ngOnInit() {
		this.settings.currentLanguageSwitchLinks = null;
	}

}
