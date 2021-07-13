import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { SettingsService } from '@app/_services';
import { Location } from '@angular/common';
import {
  CertificateFinalDocumentDashboardSidebar,
} from '../../models/interfaces/certificate-final-document-dashboard-sidebar';

@Component({
  selector: 'certificates-dashboard-detail-exam-certificate',
  templateUrl: './certificates-dashboard-detail-exam-certificate.component.html',
  styleUrls: ['./certificates-dashboard-detail-exam-certificate.component.scss'],
})
export class CertificatesDashboardDetailExamCertificateComponent implements OnInit {

  public certificate: any;
  public examResults: any;
  public dashboardLink = '/töölaud/tunnistused';
  public examinationYear: string;
  public labels: any = [];
  public breadcrumbs = [
    {
      title: 'Avaleht',
      link: '/',
    },
    {
      title: 'Minu töölaud',
      link: '/töölaud/taotlused',
    },
    {
      title: 'Tunnistused',
      link: '/töölaud/tunnistused',
    },
    {
      title: '',
    },
  ];

  public sidebar: CertificateFinalDocumentDashboardSidebar = {
    entity: {
      finalDocumentDownload: {
        certificateOwner: {},
        certificateNumber: '',
        documents: [],
        hasGradeSheet: false,
        invalid: false,
      },
    },
  };

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public location: Location,
    public translate: TranslateService,
    public settings: SettingsService,
    public http: HttpClient,
  ) {}

  ngOnInit() {
    const currentRoute = decodeURI(this.location.path()).split('/')[3];
    this.breadcrumbs[this.breadcrumbs.length - 1].title
      = currentRoute[0].toUpperCase() + currentRoute.slice(1);
  }

  examInit() {
    this.http
      .get(`${this.settings.url}/state-exams/${this.route.snapshot.params.id}?_format=json`)
        .subscribe((res) => {
          this.examResults = res['value'];
        });
  }
}
