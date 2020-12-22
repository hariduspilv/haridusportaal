import { FormGroup } from '@angular/forms';
import { SortDirection } from '@app/_core/models/Sorting';
import { sortByMultipleKeys } from '@app/_core/sortingUtilities';
import {
  CertificateDocument,
  CertificateDocumentWithClassifier,
  FormattedCertificateDocumentData,
} from './models/certificate-document';
import { CertificateIndex } from './models/certificate-index';
import { CertificateTranscriptParams } from './models/certificate-transcript-params';
import { CertificateTranscriptTemplateType } from './models/certificate-transcript-template-type.enum';
import { GraduationDocumentTypeClassification } from './models/graduation-document-type-classification.enum';
import { GraduationDocumentType } from './models/graduation-document-type.enum';

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
    generalEducationDocumentType: boolean,
  ): CertificateTranscriptParams {
    const transcriptDocumentsForm = transcriptDocumentsFormGroup.getRawValue();
    const staticParameters: CertificateTranscriptParams = {
      fileFormat: transcriptFormGroup.value.fileFormat,
      TemplateTypes: CertificateTranscriptTemplateType.WithCoatOfArms,
    };
    return generalEducationDocumentType ? {
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

}
