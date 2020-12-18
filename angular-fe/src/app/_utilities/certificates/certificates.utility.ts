import { FormGroup } from '@angular/forms';
import { CertificateTranscriptTemplateType } from '@app/_enums/certificates/certificate-transcript-template-type.enum';
import { GraduationDocumentTypeClassification } from '@app/_enums/certificates/graduation-document-type-classification.enum';
import { GraduationDocumentType } from '@app/_enums/certificates/graduation-document-type.enum';
import { ClassifierItemText } from '@app/_interfaces/classifiers/ClassifierItemText';
import { CertificateIndex } from '@app/_interfaces/certificates/certificate-index';
import { CertificateTranscriptParams } from '@app/_interfaces/certificates/certificate-transcript-params';
import { ClassifierItemsQuery, ClassifierItemsQueryItem } from '@app/_interfaces/classifiers/classifier-items-query';
import { CertificateDocumentContent } from '@app/_interfaces/certificates/certificate-document-content';
import {
  CurrentOwnerData,
  FormattedCurrentOwnerData
} from '@app/_interfaces/certificates/current-owner-data';
import {
  CertificateDocument,
  CertificateDocumentWithClassifier,
  FormattedCertificateDocumentData
} from '@app/_interfaces/certificates/certificate-document';
import { FileFormat } from '@app/_enums/file/file-format.enum';
import {
  GraduationDocumentTypeBucket,
  GraduationDocumentTypeBuckets
} from './graduation-document-type-classification-buckets';

export class CertificatesUtility {
  static graduationDocumentBuckets = new GraduationDocumentTypeBuckets();

  public static getGraduationDocumentBucket(
    type: GraduationDocumentType
  ): GraduationDocumentTypeClassification {
    return this.graduationDocumentBuckets.buckets.find(
      (el: GraduationDocumentTypeBucket) => el.item === type
    ).bucket;
  }

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
      supplement: this.getLatestDocument(supplements)
    };
  }

  public static getCertificates = (documentsArray: CertificateDocument[]):
  CertificateDocument[] => documentsArray.filter(
    (doc) => ((doc.type as string).includes(GraduationDocumentTypeClassification.CERTIFICATE)
        || (doc.type as string).includes(GraduationDocumentTypeClassification.CERTIFICAT)
        || (doc.type as string).includes(GraduationDocumentTypeClassification.DIPLOMA))
        && !(doc.type as string).includes(GraduationDocumentTypeClassification.SUPPLEMENT)
  );

  public static getDocumentByType = (
    documentsArray: CertificateDocument[],
    documentType: GraduationDocumentTypeClassification
  ): CertificateDocument[] => documentsArray.filter((doc) => doc.type.includes(documentType));

  public static getLatestDocument = (documentsArray: CertificateDocument[]):
  CertificateDocument => (
    documentsArray && documentsArray.length
      ? documentsArray
        .reduce((next, current) => (next.revision > current.revision ? next : current))
      : {} as CertificateDocument);

  public static parseDocumentStringContentOrDefault(
    document: CertificateDocument
  ): CertificateDocumentContent {
    return typeof document.content === 'string'
      ? JSON.parse(document.content)
      : document.content;
  }

  public static getCurrentPersonalData(
    certificateContent: CertificateDocumentContent, currentOwnerData: CurrentOwnerData
  ): FormattedCurrentOwnerData {
    return {
      ...currentOwnerData,
      isNewIdCode: certificateContent.graduate.idCode !== currentOwnerData.idCode,
      isNewFirstName: certificateContent.graduate.firstName !== currentOwnerData.firstName,
      isNewLastName: certificateContent.graduate.lastName !== currentOwnerData.lastName
    };
  }

  /**
   * Preserving this in case it is needed after test
   * @param documentsArray - provided documents
   * @param graduationDocumentTypes - graduation document type classifiers
   */
  public static getDocumentsListWithSupplements(documentsArray: CertificateDocument[],
    graduationDocumentTypes: ClassifierItemsQuery):
    CertificateDocument[] {
    return this.documentsWithShortNames(documentsArray, graduationDocumentTypes);

    /**
     * Not sure if the following is needed...
     * 1. Selecting documents by type
     * 2. Removing older revisions i.e duplicates of the same document.
     */

    // const typesToInclude: string[] = ['CERTIFICATE', 'CERTIFICAT', 'DIPLOMA', 'SUPPLEMENT'];
    // const documents = this.filterDocumentsByType(documentsArray, typesToInclude);

    // return documents.reduce((acc: CertificateDocument[], current: CertificateDocument) => {
    //   const typeAndLanguageMatch = acc.find((filtered) => (current.type === filtered.type
    //     && current.language === filtered.language));
    //   if (typeAndLanguageMatch && current.revision <= typeAndLanguageMatch.revision) return acc;
    //   if (typeAndLanguageMatch) {
    //     return [...acc.filter((elem) => elem !== typeAndLanguageMatch), current];
    //   }
    //   return [...acc, current];
    // }, []);
  }

  public static sortByMainDocument(documentsArray: CertificateDocumentWithClassifier[],
    index: CertificateIndex): CertificateDocumentWithClassifier[] {
    return documentsArray.sort(
      (a: CertificateDocumentWithClassifier,
        b: CertificateDocumentWithClassifier) => (this.isMainDocument(b, index) ? 1 : -1)
    );
  }

  public static gatherTranscriptRequestParameters(transcriptFormGroup: FormGroup,
    generalEducationDocumentType: boolean): CertificateTranscriptParams {
    const transcriptFormGroupRawValue = transcriptFormGroup.getRawValue();
    const staticParameters: CertificateTranscriptParams = {
      fileFormat: transcriptFormGroupRawValue.fileFormat,
      TemplateTypes: CertificateTranscriptTemplateType.WithCoatOfArms,
    };
    return generalEducationDocumentType ? {
      ...staticParameters,
      scope: transcriptFormGroupRawValue.scope,
    } : {
      ...staticParameters,
      documentIds: this.gatherSelectedDocumentKeys(transcriptFormGroupRawValue.documentIds),
    };
  }

  public static gatherActionRequestParameters(documentId: number): CertificateTranscriptParams {
    return {
      fileFormat: FileFormat.Pdf,
      TemplateTypes: CertificateTranscriptTemplateType.WithoutCoatOfArms,
      documentIds: [`${documentId}`],
    };
  }

  /**
   * Checks if the provided document is the main document (certificate.type equals document.type)
   * The latter check is made because of faulty data from BE, e.g 'CERTIFICAT' not 'CERTIFICATE'
   * @param document - document
   * @param index - Certificate request index data.
   */
  public static isMainDocument(document: CertificateDocument,
    index: CertificateIndex): boolean {
    return document.type === index.type
      || document.type === index.type.substring(0, index.type.length - 1);
  }

  public static isGeneralEducationDocumentType(index: CertificateIndex): boolean {
    return index.type === GraduationDocumentType.BASIC_EDUCATION_CERTIFICATE
      || index.type === GraduationDocumentType.GENERAL_EDUCATION_CERTIFICATE;
  }

  /**
   * Returns all selected documentIds as string[]
   * @param documentIds - Form group consisting of document ids and their corresponding values
   */
  private static gatherSelectedDocumentKeys(documentIds: string[]): string[] {
    if (!documentIds || !Object.keys(documentIds).length) return null;
    return Object.keys(documentIds).filter((key) => documentIds[key]);
  }

  /**
   * Not sure if I need this...
   * @param documentsArray - documents
   * @param typesToInclude - document types to include
   * @param typesToExclude - document types to exclude
   */
  private static filterDocumentsByType(documentsArray: CertificateDocument[],
    typesToInclude: string[], typesToExclude: string[] = []):
    CertificateDocument[] {
    return documentsArray.filter(
      (doc) => typesToInclude.find((included) => (doc.type as string).includes(included))
      && !typesToExclude.find((excluded) => (doc.type as string).includes(excluded))
    );
  }

  /**
   * finds matching classifier to add to documents.
   * @param documentsArray - documents
   * @param graduationDocumentTypes - Graduation document type classifier items
   */
  public static documentsWithShortNames(documentsArray: CertificateDocument[],
    graduationDocumentTypes: ClassifierItemsQuery):
    CertificateDocumentWithClassifier[] {
    return documentsArray.map((document: CertificateDocument) => ({
      ...document,
      metadata: (graduationDocumentTypes.classifierItems.find(
        (item: ClassifierItemsQueryItem) => item.code === document.type
      ) as ClassifierItemText),
    }));
  }
}
