import { Content } from '@app/_core/models/interfaces/main';

export interface StudyFieldRightColumn {
	fieldAdditionalLinks: {
		fieldLinks: string;
	}[];
	fieldStudy: {
		fieldAuthor: Content[] | string;
		fieldYear: Content[] | string;
		fieldPublicationType: string[];
	}[];
}
