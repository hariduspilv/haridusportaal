import { StudyFieldRightColumn } from './study-field-right-column';

export interface Study {
	nid: number;
	title: string;
	path: string;
	fieldLabel: string[];
	fieldRightColumn: StudyFieldRightColumn[];
	fieldStudyTag: string[];
	fieldCustomBoolean: boolean;
}
