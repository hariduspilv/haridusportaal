import { EntityObject, EntityUrl } from '@app/_core/models/interfaces/main';
import { StudyFieldRightColumn } from './study-field-right-column';

export interface Study {
  nid: number;
  title: string;
  entityUrl: EntityUrl;
  fieldLabel: EntityObject[];
  fieldRightColumn: StudyFieldRightColumn;
  fieldStudyTag: EntityObject;
}
