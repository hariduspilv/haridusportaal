import { GraduationDocumentTypeClassification } from '@app/_enums/certificates/graduation-document-type-classification.enum';
import { GraduationDocumentType } from '@app/_enums/certificates/graduation-document-type.enum';

export interface GraduationDocumentTypeBucket {
  item: GraduationDocumentType;
  bucket: GraduationDocumentTypeClassification;
}

export class GraduationDocumentTypeBuckets {
  private certificateBucket = {
    bucket: GraduationDocumentTypeClassification.CERTIFICATE,
    items: [
      GraduationDocumentType.GENERAL_EDUCATION_TRANSCRIPT_OF_GRADES,
      GraduationDocumentType.GENERAL_EDUCATION_CERTIFICATE,
      GraduationDocumentType.BASIC_EDUCATION_TRANSCRIPT_OF_GRADES,
      GraduationDocumentType.BASIC_EDUCATION_CERTIFICATE,
    ],
  };
  private diplomaBucket = {
    bucket: GraduationDocumentTypeClassification.DIPLOMA,
    items: [
      GraduationDocumentType.RESIDENCY_DIPLOMA_SUPPLEMENT,
      GraduationDocumentType.RESIDENCY_COMPLETION_CERTIFICATE,
      GraduationDocumentType.DOCTORAL_DEGREE_DIPLOMA_SUPPLEMENT,
      GraduationDocumentType.DOCTORAL_DEGREE_DIPLOMA,
      GraduationDocumentType.MASTERS_DEGREE_DIPLOMA_SUPPLEMENT,
      GraduationDocumentType.MASTERS_DEGREE_DIPLOMA,
      GraduationDocumentType.PROFESSIONAL_HIGHER_EDUCATION_DIPLOMA_SUPPLEMENT,
      GraduationDocumentType.PROFESSIONAL_HIGHER_EDUCATION_DIPLOMA,
      GraduationDocumentType.BACHELORS_DEGREE_DIPLOMA_SUPPLEMENT,
      GraduationDocumentType.BACHELORS_DEGREE_DIPLOMA,
    ],
  };

  private vocationBucket = {
    bucket: GraduationDocumentTypeClassification.VOCATION,
    items: [
      GraduationDocumentType.VOCATIONAL_PROFESSIONAL_EDUCATIONAL_STUDY_TRANSCRIPT_OF_GRADES,
      GraduationDocumentType.VOCATIONAL_PROFESSIONAL_EDUCATIONAL_STUDY_CERTIFICATE,
      GraduationDocumentType.VOCATIONAL_TRAINING_TRANSCRIPT_OF_GRADES,
      GraduationDocumentType.VOCATIONAL_TRAINING_CERTIFICATE,
      GraduationDocumentType.VOCATIONAL_TRAINING_CERTIFICAT,
      GraduationDocumentType.VOCATIONAL_SECONDARY_EDUCATION_TRANSCRIPT_OF_GRADES,
      GraduationDocumentType.VOCATIONAL_SECONDARY_EDUCATION_CERTIFICATE,
    ]
  };

  get buckets(): GraduationDocumentTypeBucket[] {
    let b = [];
    [this.certificateBucket, this.diplomaBucket, this.vocationBucket].forEach((bucket) => {
      b = [...b, ...bucket.items.map((item) => ({
        item,
        bucket: bucket.bucket as GraduationDocumentTypeClassification,
      }))];
    });
    return b;
  }
}
