import { MappedStudy } from './models/mapped-study';
import { Study } from './models/study';

export class StudyUtility {

  private static joinArrayToString(elements: (string | number)[]): string {
    return elements.join(', ');
  }

  private static gatherJoinedInlineFields(study: Study): string[] {
    const flattenedFieldPublicationTypes =
        study.fieldRightColumn.entity.fieldStudy.entity.fieldPublicationType
          .map(publication => publication.entity.entityLabel);
    return [
      this.joinArrayToString(study.fieldRightColumn.entity.fieldStudy.entity.fieldAuthor),
      this.joinArrayToString(study.fieldRightColumn.entity.fieldStudy.entity.fieldYear),
      this.joinArrayToString(flattenedFieldPublicationTypes),
    ];
  }

  public static mapStudyListViewEntities(entities: Study[]): MappedStudy[] {
    return entities.map((study: Study) => {
      const mappedInlineFields = this.gatherJoinedInlineFields(study).filter((field: string) => field);
      return {
        ...study,
        mappedInlineFields,
      };
    });
  }

}
