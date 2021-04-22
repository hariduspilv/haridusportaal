import {Content, EntityObject, FullTextUrl, StudyImages} from '@app/_core/models/interfaces/main';
import {MappedStudyAccordion} from '@app/modules/study/models/mapped-study-accordion';

export interface MappedStudyPage {
	title: string;
	fieldCustomBoolean: boolean;	// esiletõstetud silt
	fieldStudyTag: EntityObject;
	fieldIntroduction: string;
	fieldContent: Content;	// fulltext
	fieldAdditionalImages: StudyImages[];
	fieldStudyText: FullTextUrl;
	fieldAccordion: MappedStudyAccordion;
	fieldLabel: EntityObject[];	// tags
}
