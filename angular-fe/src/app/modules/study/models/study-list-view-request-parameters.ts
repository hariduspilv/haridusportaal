export interface StudyListViewRequestParameters {
  titleValue?: string;
  titleEnabled: boolean;
  studyTopicValue?: string[];
  studyTopicEnabled: boolean;
  publicationTypeValue?: string[];
  publicationTypeEnabled: boolean;
  publisherValue?: string[];
  publisherEnabled: boolean;
  publicationLanguageValue?: string[];
  publicationLanguageEnabled: boolean;
  studyLabelValue?: string[];
  studyLabelEnabled: boolean;
  dateTo?: string;
  dateToEnabled: boolean;
  dateFrom?: string;
  dateFromEnabled: boolean;
  highlightedStudyEnabled: boolean;
  sortField: string;
  indicatorSort: boolean;
  sortDirection: string;
  nidEnabled: boolean;
  limit: number;
  offset: number;
  lang: string;
  highlightedStudyNidEnabled?: boolean;
  highlightedStudyNid?: string;
}
