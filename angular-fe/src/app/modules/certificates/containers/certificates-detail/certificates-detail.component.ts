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
        this.getLatestDocuments(res.index);
      },
      (err) => {
        this.loading = false;
        this.notFound = true;
      });

  }

  private getLatestDocuments(index: CertificateIndex) {
    const { documents } = index;
    const documentRequests: Observable<CertificateDocumentResponse>[] = [];
    if (index.documents.length > 0) {
      const params = this.accessType === AccessType.ACCESS_CODE
      ? { accessType: AccessType.ACCESS_CODE, accessorCode: this.accessorCode }
      : { accessType: this.accessType };
      this.documents = CertificatesUtility.getLatestDocumentData(documents);
      if (this.documents.certificate?.id) {
        documentRequests.push(
          this.api.fetchDocumentWithParams(this.documents.certificate.id, params),
        );
        if (Object.keys(this.documents.transcript).length) {
          documentRequests.push(
            this.api.fetchDocumentWithParams(this.documents?.transcript.id, params),
          );
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
            this.documents,
            this.transcriptDocuments,
            this.generalEducationDocumentType,
            this.accessType,
            this.certificateData);
          this.loading = false;
          setTimeout(() => {
            (<HTMLElement>document.querySelector('.block__title__middle-tabs').firstElementChild)
            .focus();
          });
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
}
