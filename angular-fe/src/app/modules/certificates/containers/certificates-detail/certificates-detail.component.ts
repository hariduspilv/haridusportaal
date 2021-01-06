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
import { AccessType } from '../../models/enums/access-type.enum';

@Component({
  selector: 'certificates-detail',
  templateUrl: './certificates-detail.component.html',
  styleUrls: ['./certificates-detail.component.scss'],
})
export class CertificatesDetailComponent implements OnInit {

  public loading = true;
  public notFound = false;
  public documents: FormattedCertificateDocumentData;
  public transcriptDocuments: CertificateDocumentWithClassifier[];
  public mainLanguage = GraduationDocumentLanguage.emakeelEt;
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
  public certificateData: CertificateData;
  public generalEducationDocumentType: boolean;

  constructor(
    private route: ActivatedRoute,
    public http: HttpClient,
    public settings: SettingsService,
    private translate: TranslateService,
    private api: CertificatesApi,
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

    const URL = this.accessType === AccessType.ACCESS_CODE
      ? `${this.settings.ehisUrl}/certificates/v1/certificate/ACCESS_CODE/${params.certificateNr}/${this.accessorCode}`
      : `${this.settings.ehisUrl}/certificates/v1/certificate/${params.id}?accessType=${this.accessType}`;

    this.http.get(URL).subscribe(
      (res: CertificateData) => {
        this.certificateData = res;
        this.generalEducationDocumentType =
          CertificatesUtility.isGeneralEducationDocumentType(res.index);
        this.getLatestDocuments(res);
      },
      (err) => {
        this.loading = false;
        this.notFound = true;
      });

  }

  private getLatestDocuments(data: CertificateData) {
    const { documents } = data.index;
    const documentRequests: Observable<CertificateDocumentResponse>[] = [];
    if (data.index.documents.length > 0) {
      const params = this.accessType === AccessType.ACCESS_CODE
      ? { accessType: AccessType.ACCESS_CODE, accessorCode: this.accessorCode }
      : { accessType: this.accessType };
      this.documents = CertificatesUtility.getLatestDocumentData(documents);
      if (this.documents.certificate?.id) {
        // Request certificate itself by ID
        documentRequests.push(this.api.fetchDocumentWithParams(this.documents.certificate.id, params));
        // Request transcript by ID
        if (Object.keys(this.documents.transcript).length) {
          documentRequests.push(this.api.fetchDocumentWithParams(this.documents?.transcript.id, params));
        }
        // Request supplement by ID
        if (Object.keys(this.documents.supplement).length) {
          documentRequests.push(this.api.fetchDocumentWithParams(this.documents?.supplement.id, params));
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
            this.documents,
            this.transcriptDocuments,
            this.generalEducationDocumentType,
            this.accessType,
            this.certificateData);
          this.loading = false;
        });
      } else {
        this.sidebar = CertificatesUtility.composeSidebarData(
          this.documents,
          null,
          this.generalEducationDocumentType,
          this.accessType,
          this.certificateData);
        this.loading = false;
        setTimeout(() => {
          (<HTMLElement>document.querySelector('.block__title__middle-tabs').firstElementChild)
          .focus();
        });
      }
    });
  }

  public ngOnInit() {
    this.breadcrumbs = [...this.path];
    const params = this.route.snapshot.params;
    const queryParams = this.route.snapshot.queryParamMap;
    if (queryParams.get('avalikustatud')) {
      this.accessType = AccessType.DISCLOSURE;
    } else {
      this.accessType = params.accessorCode && params.certificateNr
        ? AccessType.ACCESS_CODE
        : AccessType.ID_CODE;
    }
    this.getCertificate();
  }
  
  public get typeTranslation(): string {
    if (!this.documents?.certificate) {
      return 'frontpage.dashboard_tabs_certificate';
    }
    if (this.documents.certificate.type.indexOf('DIPLOMA') !== -1) {
      return 'finaldocuments.diploma';
    }
    return 'certificates.graduation_certificate';
  }
}
