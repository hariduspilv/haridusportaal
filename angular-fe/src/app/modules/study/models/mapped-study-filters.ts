import { FormItemOption } from '@app/_assets/formItem';
import { YearOption } from './year-option';

export interface MappedStudyFilters {
  publicationTypeOptions: FormItemOption[];
  publicationLanguageOptions: FormItemOption[];
  studyLabelOptions: FormItemOption[];
  studyTopicsOptions: FormItemOption[];
  yearRange: YearOption[];
}
