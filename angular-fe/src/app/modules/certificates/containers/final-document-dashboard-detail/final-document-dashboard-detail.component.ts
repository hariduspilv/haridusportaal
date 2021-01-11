import { HttpClient } from '@angular/common/http';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { SettingsService } from '@app/_services';
import { forkJoin, Observable } from 'rxjs';
import { CertificatesApi } from '../../certificates.api.service';
import { CertificatesUtility } from '../../certificates.utility';
import { CertificateData } from '../../models/interfaces/certificate-data';
import { CertificateDocumentWithClassifier, FormattedCertificateDocumentData } from '../../models/interfaces/certificate-document';
import { CertificateDocumentResponse } from '../../models/interfaces/certificate-document-response';
import { CertificateIndex } from '../../models/interfaces/certificate-index';
import { GraduationDocumentLanguage } from '../../models/enums/graduation-document-language.enum';
import { GraduationDocumentType } from '../../models/enums/graduation-document-type.enum';
import { GraduationDocumentTypeClassification } from '../../models/enums/graduation-document-type-classification.enum';
import { CertificateDocumentContent } from '../../models/interfaces/certificate-document-content';

@Component({
  selector: 'final-document-dashboard-detail',
  templateUrl: './final-document-dashboard-detail.component.html',
  styleUrls: ['./final-document-dashboard-detail.component.scss'],
})
export class FinalDocumentDashboardDetailComponent implements OnInit {

  public documents: FormattedCertificateDocumentData;
  public transcriptDocuments: CertificateDocumentWithClassifier[];
  public mainLanguage = GraduationDocumentLanguage.emakeelEt;
  public generalEducationDocumentType = false;
  public typeTranslation = this.translate.get('certificates.graduation_certificate');

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
    if (!this.loading && tab === this.translate.get('certificates.graduation_certificate') &&
        this.certificate) {
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
        this.getLatestDocuments(val);
      });
  }

  private getLatestDocuments(data: CertificateData) {
    const { documents } = data.index;
    const documentRequests: Observable<CertificateDocumentResponse>[] = [];
    if (data.index.documents.length > 0) {
      this.documents = CertificatesUtility.getLatestDocumentData(documents);
      if (this.documents.certificate?.id) {
        // Request certificate itself by ID
        documentRequests.push(this.api.fetchDocument(this.documents.certificate.id));
        // Request transcript by ID
        if (Object.keys(this.documents.transcript).length) {
          documentRequests.push(this.api.fetchDocument(this.documents?.transcript.id));
        }
        // Request supplement by ID
        if (Object.keys(this.documents.supplement).length) {
          documentRequests.push(this.api.fetchDocument(this.documents?.supplement.id));
        }
      }
    }

    forkJoin(documentRequests).subscribe((docs: CertificateDocumentResponse[]) => {
      // Clean up certificate, supplement and transcript from response
      this.documents = CertificatesUtility.parseSupplementaryDocuments(this.documents, docs, data);
      if (!this.generalEducationDocumentType) {
        this.api.getCertificateDocumentsWithClassifiers(
          data.index,
          this.mainLanguage,
        ).subscribe((documentsWithClassifiers: CertificateDocumentWithClassifier[]) => {
          this.transcriptDocuments = CertificatesUtility
            .sortTranscriptDocuments(documentsWithClassifiers);
          this.sidebar = CertificatesUtility.composeSidebarData(
            this.documents, this.transcriptDocuments, this.generalEducationDocumentType);
          this.typeTranslation = CertificatesUtility.typeTitle(
            this.documents.certificate,
            this.transcriptDocuments,
          );
          if (data.index.qualificationWithinCurrentFramework) {
            this.api.getQualificationFrameworks(
                data.index.qualificationWithinCurrentFramework,
                this.documents.certificate.language)
              .subscribe(resp => (this.documents.certificate.content as CertificateDocumentContent)
                .qualificationWithinCurrentFramework = resp.name);
          }
          this.loading = false;
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
