import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from '@app/_services';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Certificate } from 'tls';
import { ClassifiersApi } from '../classifiers/classifiers.api.service';
import { ClassifierDefinitionCode } from '../classifiers/models/classifier-definition-code.enum';
import { ClassifierItemsQuery } from '../classifiers/models/classifier-items-query';
import { CertificatesUtility } from './certificates.utility';
import { CertificateResponse } from './models/certificate';
import { CertificateActionResponse } from './models/certificate-action-response';
import { CertificateDocumentWithClassifier } from './models/certificate-document';
import { CertificateDocumentResponse } from './models/certificate-document-response';
import { CertificateIndex } from './models/certificate-index';
import { CertificateTranscriptParams } from './models/certificate-transcript-params';
import { GraduationDocumentLanguage } from './models/graduation-document-language.enum';

@Injectable({
  providedIn: 'root',
})
export class CertificatesApi {

  private certificatesUrl = `${this.settings.ehisUrl}/certificates/v1`;

  constructor(
    private settings: SettingsService,
    private classifiers: ClassifiersApi,
    private http: HttpClient,
  ) {
  }

  fetchDocument(documentId: number): Observable<CertificateDocumentResponse> {
    const url = `${this.certificatesUrl}/certificateDocument/${documentId}`;

    return this.http.get<CertificateDocumentResponse>(url);
  }

  fetchDocumentWithParams(documentId: number, params: {}): Observable<CertificateDocumentResponse> {
    const url = `${this.certificatesUrl}/certificateDocument/${documentId}`;

    return this.http.get<CertificateDocumentResponse>(url, { params });
  }

  downloadTranscript(id: number, params: CertificateTranscriptParams): Observable<Blob> {
    return this.http.get(`${this.certificatesUrl}/certificateTranscript/${id}`,
                         { params, responseType: 'blob' });
  }

  fetchCertificate(id: string): Observable<CertificateResponse> {
    const url = `${this.certificatesUrl}/certificate/${id}`;

    return this.http.get<Certificate>(url)
      .pipe(catchError(() => of(null)));
  }

  fetchCertificateActions(id): Observable<CertificateActionResponse> {
    const url = `${this.certificatesUrl}/certificateActions/${id}`;

    return this.http.get<CertificateActionResponse>(url)
      .pipe(catchError(() => of(null)));
  }

  getShortName(): Observable<ClassifierItemsQuery> {
    return this.classifiers.fetchClassifierItemsByDefinitionCode(
      ClassifierDefinitionCode.GRADUATION_DOCUMENT_TYPE,
    );
  }

  getCertificateDocumentsWithClassifiers(
    index: CertificateIndex,
    mainLanguage: GraduationDocumentLanguage,
  ): Observable<CertificateDocumentWithClassifier[]> {
    const requests: Observable<CertificateDocumentWithClassifier>[] = [];
    index.documents.forEach((document) => {
      requests.push(
        this.classifiers.fetchClassifierItemByItemCodeWithParameters(
          document.type,
          { language: this.getLanguageCodeFromString(document.language) }
        ).pipe(map(graduationType => ({
          ...document,
          metadata: graduationType,
          isMainDocument: CertificatesUtility.documentMatchesCertificateType(document, index),
          isInMainLanguage: CertificatesUtility.documentMatchesMainLanguage(document, mainLanguage),
        }))),
      );
    });
    return forkJoin(requests);
  }

  getLanguageCodeFromString(languageString: string): string {
    return languageString ? languageString.split(':')[1] : null;
  }
}
