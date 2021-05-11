import { EntityLink } from '@app/_core/models/interfaces/main';
import { MappedStudyPageFieldRightColumnStudyData } from './mapped-study-page-field-right-column-study-data';

export interface MappedStudyPageFieldRightColumn {
  fieldLinks: EntityLink[];
  fieldStudy: MappedStudyPageFieldRightColumnStudyData;
}
