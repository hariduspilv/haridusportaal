import {Content, EntityObject, FullTextUrl, ImageEntity} from '@app/_core/models/interfaces/main';
import {MappedStudyAccordion} from '@app/modules/study/models/mapped-study-accordion';
import {StudyPageFieldRightColumn} from './study-page-field-right-column';

export interface MappedStudyPage {
	title: string;
	fieldCustomBoolean: boolean;
	fieldStudyTag: EntityObject;
	fieldIntroduction: string;
	fieldContent: Content;
	fieldAdditionalImages: ImageEntity[];
	fieldStudyText: FullTextUrl;
	fieldAccordion: MappedStudyAccordion;
	fieldLabel: EntityObject[];
	fieldRightColumn: StudyPageFieldRightColumn;
}
