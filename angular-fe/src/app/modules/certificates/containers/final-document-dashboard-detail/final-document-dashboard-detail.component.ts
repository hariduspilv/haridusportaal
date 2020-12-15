import { HttpClient } from '@angular/common/http';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { SettingsService } from '@app/_services';
import { of, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'final-document-dashboard-detail',
  templateUrl: './final-document-dashboard-detail.component.html',
  styleUrls: ['./final-document-dashboard-detail.component.scss'],
})
export class FinalDocumentDashboardDetailComponent implements OnInit {

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
  @ViewChildren('certificate') public certificate: QueryList<any>;

  public loading = true;

  constructor(
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
    const documents: any = {};
    const certificates = documentsArray.filter((doc) => {
      return doc.type === 'GRADUATION_DOCUMENT_TYPE:BASIC_EDUCATION_CERTIFICATE' ||
        doc.type === 'GRADUATION_DOCUMENT_TYPE:GENERAL_EDUCATION_CERTIFICATE';
    });

    const transcriptsOfgrades = documentsArray.filter((doc) => {
      return doc.type === 'GRADUATION_DOCUMENT_TYPE:BASIC_EDUCATION_TRANSCRIPT_OF_GRADES' ||
        doc.type === 'GRADUATION_DOCUMENT_TYPE:GENERAL_EDUCATION_TRANSCRIPT_OF_GRADES';
    });

    if (certificates.length > 0) {
      documents.certificate = certificates.reduce((next, current) => {
        return next.revision > current.revision ? next : current;
      });
    }

    if (transcriptsOfgrades.length > 0) {
      documents.gradesheet = transcriptsOfgrades.reduce((next, current) => {
        return next.revision > current.revision ? next : current;
      });
    }

    const URL =
      `${this.settings.ehisUrl}/certificates/v1/certificateDocument/{DOCUMENT_ID}`;

    const req = [
      this.http.get(URL.replace('{DOCUMENT_ID}', documents.certificate.id)).pipe(
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
      this.documents.certificate.content = JSON.parse(this.documents.certificate.content);
      if (docs[1]) {
        this.documents.gradesheet = docs[1].document;
        this.documents.gradesheet.content = JSON.parse(this.documents.gradesheet.content);
      }
      this.sidebar.entity.finalDocumentDownload.hasGradeSheet = this.documents.gradesheet != null
        && this.documents.gradesheet.status !== 'CERT_DOCUMENT_STATUS:INVALID';
      this.sidebar.entity.finalDocumentHistory.issuerInstitution
        = this.documents.certificate.content.educationalInstitution.name;
      this.sidebar.entity.finalDocumentAccess.issuerInstitution
        = this.documents.certificate.content.educationalInstitution.name;
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
