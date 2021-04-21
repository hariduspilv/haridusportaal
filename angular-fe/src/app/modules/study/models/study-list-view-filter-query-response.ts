import { Entity } from '@app/_core/models/interfaces/main';

export interface StudyListViewFilterQueryResponse {
  data: {
    publicationTypeOptions: {
      entities: Entity[];
    };
    publicationLanguageOptions: {
      entities: Entity[];
    };
    studyLabelOptions: {
      entities: Entity[];
    };
    studyTopicsOptions: {
      entities: Entity[];
    };
  };
  errors?: Error[];
}
