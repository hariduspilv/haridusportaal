import { EntityObject } from '@app/_core/models/interfaces/main';

export interface StudyFieldRightColumn {
  entity: {
    fieldStudy: {
      entity: {
        fieldAuthor: string[];
        fieldYear: number[];
        fieldPublicationType: EntityObject[];
      };
    };
  };
}
