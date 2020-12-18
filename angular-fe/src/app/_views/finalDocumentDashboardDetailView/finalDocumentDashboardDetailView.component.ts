import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '@app/_services';
import { catchError } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { CertificatesService } from '@app/_services/certificates/certificate-service.service';

@Component({
  templateUrl: 'finalDocumentDashboardDetailView.template.html',
  styleUrls: ['./finalDocumentDashboardDetailView.styles.scss'],
})

export class FinalDocumentDashboardDetailViewComponent implements OnInit {

  @ViewChildren('certificate') public certificate: QueryList<any>;

  public loading = true;
  public isDisclosureAllowed = false;

  public documents: any = {};

  public sidebar = {
    entity: {
      finalDocumentDownload: {
        certificateName: '',
        certificateNumber: '',
        hasGradeSheet: false,
        invalid: false,
      },
      finalDocumentAccess: {
        issuerInstitution: '',
        typeName: '',
        document: null,
      },
      finalDocumentHistory: {
        issuerInstitution: '',
      },
    },
  };

  public path = [
    {
      title: 'Avaleht',
      link: '/',
    },
    {
      title: 'Töölaud: Tunnistused',
      link: '/töölaud/tunnistused',
    },
  ];

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private http: HttpClient,
    private settings: SettingsService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
  ) {
  }

  public ngOnInit() {
    this.getData();
  }

  public tabChanged(tab) {
    if (!this.loading && tab === this.translate.get('certificates.graduation_certificate')) {
      setTimeout(() => {
        this.certificate.first.calculateCertificateSize();
      });
    }
  }

  private getData() {
    const id = this.route.snapshot.params.id;
    this.http
      .get(`${this.settings.ehisUrl}/certificates/v1/certificate/${id}`).subscribe((val: any) => {
        this.path = [...this.path, { title: val.index.typeName, link: '' }];
        this.getLatestDocuments(val.index.documents);
      });
  }

  private getLatestDocuments(documentsArray) {
    let documents: any = {};
    const certificates = documentsArray.filter(
      (doc) => ((doc.type as string).includes('CERTIFICATE')
        || (doc.type as string).includes('CERTIFICAT')
        || (doc.type as string).includes('DIPLOMA'))
      && !(doc.type as string).includes('SUPPLEMENT')
    );
    const transcriptsOfgrades = documentsArray.filter((doc) => doc.type.includes('TRANSCRIPT'));

    if (certificates.length > 0) {
      documents = {
        ...documents,
        certificates: certificates.reduce((next, current) => (next.revision > current.revision ? next : current)),
      };
      this.sidebar.entity.finalDocumentAccess.typeName = documents.certificates.typeName;
    }

    if (transcriptsOfgrades.length > 0) {
      documents = {
        ...documents,
        transcript: transcriptsOfgrades.reduce((next, current) => (next.revision > current.revision ? next : current)),
      };
    }
    const URL =
      `${this.settings.ehisUrl}/certificates/v1/certificateDocument/{DOCUMENT_ID}`;
    const req = [
      this.http.get(URL.replace('{DOCUMENT_ID}', documents.certificates.id)).pipe(
        catchError(() => of(null)),
      ),
    ];

    if (documents.gradesheet) {
      req.push(
        this.http.get(URL.replace('{DOCUMENT_ID}', documents.gradesheet.id)).pipe(
          catchError(() => of(null)),
        ),
      );
    }

    forkJoin(req).subscribe((docs) => {
      this.documents.certificate = docs[0].document;
      this.sidebar.entity.finalDocumentAccess.document = this.documents.certificate;
      this.documents.certificate.content = JSON.parse(this.documents.certificate.content);
      if (docs[1]) {
        this.documents.gradesheet = docs[1].document;
        this.documents.gradesheet.content = JSON.parse(this.documents.gradesheet.content);
      }
      this.sidebar.entity.finalDocumentDownload.hasGradeSheet = this.documents.gradesheet != null
        && this.documents.gradesheet.status !== 'CERT_DOCUMENT_STATUS:INVALID';
      this.sidebar.entity.finalDocumentHistory.issuerInstitution
        = this.documents.certificate.content.educationalInstitutions[0].name || '';
      this.sidebar.entity.finalDocumentDownload.certificateName =
        `${this.documents.certificate.content.graduate.firstName} /
        ${this.documents.certificate.content.graduate.lastName}`;
      this.sidebar.entity.finalDocumentDownload.certificateNumber =
        this.documents.certificate.content.registrationNumber;
      this.sidebar.entity.finalDocumentDownload.invalid =
        this.documents.certificate.status === 'CERT_DOCUMENT_STATUS:INVALID';
      this.loading = false;

      setTimeout(() => {
        (<HTMLElement>document.querySelector('.block__title__middle-tabs').firstElementChild)
        .focus();
      });
    });
  }
}
