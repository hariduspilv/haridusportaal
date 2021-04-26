import { EntityLink } from '@app/_core/models/interfaces/main';
import { StudyPageFieldRightColumnDataEntity } from './study-page-field-right-column-data-entity';

export interface StudyPageFieldRightColumn {
  entity: {
    fieldStudy: {
      entity: StudyPageFieldRightColumnDataEntity;
    };
    fieldAdditionalLinks: {
      entity: {
        fieldLinks: EntityLink[];
      };
    };
  };
}
