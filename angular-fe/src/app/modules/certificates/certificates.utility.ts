import { FormGroup } from '@angular/forms';
import { FinalDocumentDownloadSidebar } from '@app/_assets/sidebar/models/final-document-download-sidebar';
import { SortDirection } from '@app/_core/models/Sorting';
import { sortByMultipleKeys } from '@app/_core/sortingUtilities';
import { CertificateData } from './models/interfaces/certificate-data';
import {
  CertificateDocument,
  CertificateDocumentWithClassifier,
  FormattedCertificateDocumentData,
} from './models/interfaces/certificate-document';
import { CertificateIndex } from './models/interfaces/certificate-index';
import { CertificateTranscriptParams } from './models/interfaces/certificate-transcript-params';
import { CertificateTranscriptTemplateType } from './models/enums/certificate-transcript-template-type.enum';
import { GraduationDocumentTypeClassification } from './models/enums/graduation-document-type-classification.enum';
import { GraduationDocumentType } from './models/enums/graduation-document-type.enum';
import { CertificateDocumentContent } from './models/interfaces/certificate-document-content';
import { CertificateDocumentResponse } from './models/interfaces/certificate-document-response';

export class CertificatesUtility {

  public static isGeneralEducationDocumentType(index: CertificateIndex): boolean {
    return index.type === GraduationDocumentType.BASIC_EDUCATION_CERTIFICATE
      || index.type === GraduationDocumentType.GENERAL_EDUCATION_CERTIFICATE;
  }

  public static getLatestDocument = (documentsArray: CertificateDocument[]):
  CertificateDocument => (
    documentsArray && documentsArray.length
      ? documentsArray
        .reduce((next, current) => (next.revision > current.revision ? next : current))
      : {} as CertificateDocument)

  public static getDocumentByType = (
    documentsArray: CertificateDocument[],
    documentType: GraduationDocumentTypeClassification,
  ): CertificateDocument[] => documentsArray.filter(doc => doc.type.includes(documentType))

  public static getLatestDocumentData(documentsArray: CertificateDocument[]):
    FormattedCertificateDocumentData {
    const certificates = this.getCertificates(documentsArray);
    const transcripts = this
      .getDocumentByType(documentsArray, GraduationDocumentTypeClassification.TRANSCRIPT);
    const supplements = this
      .getDocumentByType(documentsArray, GraduationDocumentTypeClassification.SUPPLEMENT);

    return {
      certificate: this.getLatestDocument(certificates),
      transcript: this.getLatestDocument(transcripts),
      supplement: this.getLatestDocument(supplements),
    };
  }

  public static getCertificates = (documentsArray: CertificateDocument[]):
  CertificateDocument[] => documentsArray.filter(
    doc => ((doc.type as string).includes(GraduationDocumentTypeClassification.CERTIFICATE)
        || (doc.type as string).includes(GraduationDocumentTypeClassification.CERTIFICAT)
        || (doc.type as string).includes(GraduationDocumentTypeClassification.DIPLOMA))
        && !(doc.type as string).includes(GraduationDocumentTypeClassification.SUPPLEMENT),
  )

  public static sortTranscriptDocuments(
    documents: CertificateDocumentWithClassifier[],
  ): CertificateDocumentWithClassifier[] {
    return sortByMultipleKeys(documents, [
      { key: 'metadata.shortName', direction: SortDirection.DESC },
      { key: 'isInMainLanguage', direction: SortDirection.DESC },
      { key: 'isMainDocument', direction: SortDirection.DESC },
    ]);
  }

  public static gatherTranscriptRequestParameters(
    transcriptFormGroup: FormGroup,
    transcriptDocumentsFormGroup: FormGroup,
    sidebarData: FinalDocumentDownloadSidebar,
    accessorCode?: string,
  ): CertificateTranscriptParams {
    const transcriptDocumentsForm = transcriptDocumentsFormGroup.getRawValue();
    const staticParameters: CertificateTranscriptParams = {
      fileFormat: transcriptFormGroup.value.fileFormat,
      TemplateTypes: CertificateTranscriptTemplateType.WithCoatOfArms,
    };
    if (sidebarData.withAccess && sidebarData.accessType) {
      staticParameters.accessType = `ACCESS_TYPE:${sidebarData.accessType}`;
      if (accessorCode) staticParameters.accessorCode = accessorCode;
    }
    return sidebarData.generalEducationDocumentType ? {
      ...staticParameters,
      scope: transcriptFormGroup.value.scope,
    } : {
      ...staticParameters,
      documentIds: this.gatherSelectedDocumentKeys(transcriptDocumentsForm),
    };
  }
 /**
   * Checks if the provided document is the main document (certificate.type includes document.type)
   * @param document - document
   * @param index - Certificate request index data.
   */
  public static documentMatchesCertificateType(document: CertificateDocument,
                                               index: CertificateIndex): boolean {
    return index.type.includes(document.type);
  }

  /**
   * Checks if document is in main language
   * @param document - document
   * @param index - Certificate request index data.
   */
  public static documentMatchesMainLanguage(document: CertificateDocument,
                                            mainLanguage: string): boolean {
    return document.language === mainLanguage;
  }

  /**
   * Returns all selected documentIds as string[]
   * @param documentIds - Form group consisting of document ids and their corresponding values
   */
  private static gatherSelectedDocumentKeys(documentIds: Record<number, string>): string[] {
    if (!documentIds || !Object.keys(documentIds).length) return null;
    return Object.keys(documentIds).filter(key => documentIds[key]);
  }

  public static composeSidebarData(
    documents: FormattedCertificateDocumentData,
    allDocuments: CertificateDocumentWithClassifier[],
    generalEducationDocumentType: boolean,
    accessType?: string,
    certificateData?: CertificateData,
  ) {
    return {
      entity: {
        finalDocumentDownload: {
          generalEducationDocumentType,
          accessType,
          id: certificateData?.index?.id,
          withAccess: !!certificateData,
          accessScope: certificateData?.role?.accessScope,
          certificateName: `${documents.certificate.content['graduate'].firstName} /
            ${documents.certificate.content['graduate'].lastName}`,
          certificateNumber: documents.certificate.content['registrationNumber'],
          hasGradeSheet: documents.transcript?.status !== 'CERT_DOCUMENT_STATUS:INVALID',
          invalid: documents.certificate?.status === 'CERT_DOCUMENT_STATUS:INVALID',
          documents: allDocuments,
        },
        finalDocumentAccess: {
          issuerInstitution: documents.certificate.content['educationalInstitution']?.name,
          certificate: documents.certificate,
        },
        finalDocumentHistory: !certificateData ? {
          issuerInstitution: documents.certificate.content['educationalInstitution']?.name,
        } : null,
      },
    };
  }

  /**
   * Return string list of educational institutions from a final document
   * @param document Certificate Document
   * @returns String list of institutions, separated by comma
   */
  public static getEducationalInstitutions(document: CertificateDocument): string {
    return (document.content as CertificateDocumentContent)
      .educationalInstitutions.map(x => x.name).join(', ');
  }

  /**
   * Return string issue date from a final document
   * @param document Certificate Document
   * @returns Issue date
   */
  public static getCertificateIssueDate(document: CertificateDocument): string {
    const content = document.content as CertificateDocumentContent;
    return content.headOfSchoolDirective
      ? content.headOfSchoolDirective.issueDate
      : (content.issued ? content.issued.issueDate : '');
  }

  /**
   * Ensure that the document content is an object and return the document
   * @param certdoc Document from response
   */
  public static parseDocumentContent(certdoc: CertificateDocument): CertificateDocument {
    certdoc.content = typeof certdoc.content === 'string'
      ? JSON.parse(certdoc.content)
      : certdoc.content;
    return certdoc;
  }

  /**
   * Extract certificate, transcript and supplement from a certificate document response
   * @param response a certificate document response
   * @param data certificate data for owner information
   */
  public static parseSupplementaryDocuments(
    initial: FormattedCertificateDocumentData,
    response: CertificateDocumentResponse[],
    data: CertificateData,
  ): FormattedCertificateDocumentData {
    for (const doc of response) {
      if (doc.document.type.indexOf('SUPPLEMENT') !== -1) {
        initial.supplement = CertificatesUtility.parseDocumentContent(doc.document);
      } else if (doc.document.type.indexOf('TRANSCRIPT') !== -1) {
        initial.transcript = CertificatesUtility.parseDocumentContent(doc.document);
      } else {
        initial.certificate = CertificatesUtility.parseDocumentContent(doc.document);
        (initial.certificate.content as CertificateDocumentContent)
          .currentOwnerData = data.currentOwnerData;
      }
    }
    return initial;
  }

  public static typeTitle(
    document: CertificateDocument,
    alldocs: CertificateDocumentWithClassifier[],
  ): string {
    const classifier = alldocs.find(xdoc => xdoc.type === document.type);
    return classifier.metadata.shortName || classifier.typeName;
  }
}
