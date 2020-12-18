import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '@app/_services';
import { of, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { CertificatesUtility } from '@app/_utilities/certificates/certificates.utility';

@Component({
  templateUrl: './certificateDetailView.template.html',
  styleUrls: ['./certificateDetailView.styles.scss'],
})
export class CertificateDetailView implements OnInit {
  public loading = true;
  public notFound = false;
  public documents:any = {};
  public title = '';

  @ViewChildren('certificate') public certificate:QueryList<any>;
  @ViewChildren('gradeSheet') public gradeSheet:QueryList<any>;

  public breadcrumbs = [];

  public path: any = [
    {
      title: 'Avaleht',
      link: '/',
    },
    {
      title: 'Tunnistused',
    },
    {
      title: 'Lõpudokumendid',
      link: '/tunnistused/lõpudokumendid',
    },
  ];

  public sidebar;
  private accessorCode = '';
  private accessType = '';

  constructor(
    private route: ActivatedRoute,
    public http: HttpClient,
    public settings: SettingsService,
    private translate: TranslateService,
  ) { }

  public tabChanged(tab) {
    if (!this.loading && tab === this.translate.get('certificates.graduation_certificate')) {
      setTimeout(() => {
        this.certificate.first.calculateCertificateSize();
      });
    }
  }

  public getCertificate() {
    const params = this.route.snapshot.params;
    this.accessorCode = params.accessorCode;

    const URL = this.accessType === 'ACCESS_CODE'
      ? `${this.settings.ehisUrl}/certificates/v1/certificate/ACCESS_CODE/${params.certificateNr}/${this.accessorCode}`
      : `${this.settings.ehisUrl}/certificates/v1/certificate/${params.id}?accessType=ACCESS_TYPE:ID_CODE`;

    this.http.get(URL).subscribe(
      (res: any) => {
        this.getLatestDocuments(res.index.documents);

        this.sidebar = {
          entity: {
            finalDocumentDownload: {
              id: res.index.id,
              certificateName: '',
              certificateNumber: '',
              withAccess: true,
              accessScope: res.role.accessScope,
              accessType: this.accessType,
            },
          },
        };
      },
      (err) => {
        this.loading = false;
        this.notFound = true;
      });

  }

  public getLatestDocuments(documentsArray) {
    const documents: any = {};

    this.documents = CertificatesUtility.getLatestDocumentData(documentsArray);
    console.log(this.documents);

    // if (Object.keys(this.documents.certificate).length > 0) {
    //   documents.certificate = this.documents.certificate.reduce((next, current) => {
    //     return next.revision > current.revision ? next : current;
    //   });
    // }

    // if (Object.keys(this.documents.transcript).length > 0) {
    //   documents.gradesheet = this.documents.transcript.reduce((next, current) => {
    //     return next.revision > current.revision ? next : current;
    //   });
    // }

    const URL = this.accessType === 'ACCESS_CODE'
      ? `${this.settings.ehisUrl}/certificates/v1/certificateDocument/{DOCUMENT_ID}?accessType=ACCESS_TYPE:ACCESS_CODE&accessorCode=${this.accessorCode}`
      : `${this.settings.ehisUrl}/certificates/v1/certificateDocument/{DOCUMENT_ID}?accessType=ACCESS_TYPE:ID_CODE`;

    const req = [
      this.http.get(URL.replace('{DOCUMENT_ID}', this.documents.certificate.id)).pipe(
        catchError(() => of(null)),
      ),
    ];

    if (Object.keys(this.documents.transcript).length > 0) {
      req.push(
        this.http.get(URL.replace('{DOCUMENT_ID}', this.documents.transcript.id)).pipe(
          catchError(() => of(null)),
        ),
      );
    }

    forkJoin(req).subscribe((docs) => {
      this.documents.certificate = docs[0].document;
      this.documents.certificate.content = JSON.parse(this.documents.certificate.content);
      if (docs[1]) {
        this.documents.gradesheet = docs[1].document;
        this.documents.gradesheet.content = JSON.parse(this.documents.gradesheet.content);
      }
      this.breadcrumbs = [
        ...this.path, { title: `Tunnistus nr ${this.documents.certificate.number}` }];
      this.sidebar.entity.finalDocumentDownload.certificateName =
        `${this.documents.certificate.content.graduate.firstName} \
        ${this.documents.certificate.content.graduate.lastName}`;
      this.sidebar.entity.finalDocumentDownload.certificateNumber =
        this.documents.certificate.content.registrationNumber;
      this.sidebar.entity.finalDocumentDownload.hasGradeSheet = this.documents.gradesheet != null
        && this.documents.gradesheet.status !== 'CERT_DOCUMENT_STATUS:INVALID';
      this.sidebar.entity.finalDocumentDownload.invalid =
        this.documents.certificate.status === 'CERT_DOCUMENT_STATUS:INVALID';
      this.loading = false;

      setTimeout(() => {
        (<HTMLElement>document.querySelector('.block__title__middle-tabs').firstElementChild)
        .focus();
      });
    });
  }

  public ngOnInit() {
    this.breadcrumbs = [...this.path];
    const params = this.route.snapshot.params;
    this.accessType = params.accessorCode && params.certificateNr ? 'ACCESS_CODE' : 'ID_CODE';
    this.getCertificate();
  }

}
