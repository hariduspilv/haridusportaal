import { EntityObject } from '@app/_core/models/interfaces/main';

export interface StudyPageFieldRightColumnDataEntity {
  fieldAuthor: string[];
  fieldAuthorInstitution: string[];
  fieldPublicationLang: EntityObject[];
  fieldYear: number[];
  fieldOrderer: string[];
  fieldPublisher: string[];
  fieldPublicationType: EntityObject[];
}
