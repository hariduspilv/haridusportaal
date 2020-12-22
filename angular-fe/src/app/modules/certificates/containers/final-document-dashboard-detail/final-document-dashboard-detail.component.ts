import { HttpClient } from '@angular/common/http';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { SettingsService } from '@app/_services';
import { forkJoin, Observable } from 'rxjs';
import { CertificatesApi } from '../../certificates.api.service';
import { CertificatesUtility } from '../../certificates.utility';
import { CertificateData } from '../../models/certificate-data';
import { CertificateDocumentWithClassifier, FormattedCertificateDocumentData } from '../../models/certificate-document';
import { CertificateDocumentResponse } from '../../models/certificate-document-response';
import { CertificateIndex } from '../../models/certificate-index';
import { GraduationDocumentLanguage } from '../../models/graduation-document-language.enum';

@Component({
  selector: 'final-document-dashboard-detail',
  templateUrl: './final-document-dashboard-detail.component.html',
  styleUrls: ['./final-document-dashboard-detail.component.scss'],
})
export class FinalDocumentDashboardDetailComponent implements OnInit {

  public documents: FormattedCertificateDocumentData;
  public transcriptDocuments: CertificateDocumentWithClassifier[];
  public mainLanguage = GraduationDocumentLanguage.emakeelEt;
  generalEducationDocumentType = false;

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
    private translate: TranslateService,
    private api: CertificatesApi,
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
    this.http.get(`${this.settings.ehisUrl}/certificates/v1/certificate/${id}`)
      .subscribe((val: CertificateData) => {
        this.path = [...this.path, { title: val.index.typeName, link: '' }];
        this.generalEducationDocumentType =
          CertificatesUtility.isGeneralEducationDocumentType(val.index);
        this.getLatestDocuments(val.index);
      });
  }

  private getLatestDocuments(index: CertificateIndex) {
    const { documents } = index;
    const documentRequests: Observable<CertificateDocumentResponse>[] = [];
    if (index.documents.length > 0) {
      this.documents = CertificatesUtility.getLatestDocumentData(documents);
      if (this.documents.certificate?.id) {
        documentRequests.push(this.api.fetchDocument(this.documents.certificate.id));
        if (Object.keys(this.documents.transcript).length) {
          documentRequests.push(this.api.fetchDocument(this.documents?.transcript.id));
        }
      }
    }

    forkJoin(documentRequests).subscribe((docs: CertificateDocumentResponse[]) => {
      this.documents.certificate = docs[0].document;
      this.documents.certificate.content = JSON.parse(this.documents.certificate.content as string);
      if (docs[1]) {
        this.documents.transcript = docs[1].document;
        this.documents.transcript.content = JSON.parse(this.documents.transcript.content as string);
      }
      if (!this.generalEducationDocumentType) {
        this.api.getCertificateDocumentsWithClassifiers(
          index,
          this.mainLanguage,
        ).subscribe((documentsWithClassifiers: CertificateDocumentWithClassifier[]) => {
          this.transcriptDocuments = CertificatesUtility
            .sortTranscriptDocuments(documentsWithClassifiers);
          this.sidebar = CertificatesUtility.composeSidebarData(
            this.documents, this.transcriptDocuments, this.generalEducationDocumentType);
          this.loading = false;
          setTimeout(() => {
            (<HTMLElement>document.querySelector('.block__title__middle-tabs').firstElementChild)
            .focus();
          });
        });
      } else {
        this.sidebar = CertificatesUtility.composeSidebarData(
          this.documents, null, this.generalEducationDocumentType);
        this.loading = false;
        setTimeout(() => {
          (<HTMLElement>document.querySelector('.block__title__middle-tabs').firstElementChild)
          .focus();
        });
      }
    });
  }
}
