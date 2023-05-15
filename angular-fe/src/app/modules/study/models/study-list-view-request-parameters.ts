export interface StudyListViewRequestParameters {
	titleValue?: string;
	studyTopicValue?: string[];
	publicationTypeValue?: string[];
	publisherValue?: string[];
	publicationLanguageValue?: string[];
	studyLabelValue?: string[];
	dateTo?: string;
	dateFrom?: string;
	sortField: string;
	indicatorSort: boolean;
	sortDirection: string;
	limit: number;
	offset: number;
	lang: string;
	highlightedStudyNid?: string;
}
