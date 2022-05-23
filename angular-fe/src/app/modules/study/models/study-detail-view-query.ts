import { LanguageSwitchLink, QueryError } from '@app/_core/models/interfaces/main';
import { MappedStudyPage } from '@app/modules/study/models/mapped-study-page';

export interface StudyDetailViewQuery {
	data: {
		route: {
			entity: MappedStudyPage;
			languageSwitchLinks?: LanguageSwitchLink[];
		};
	};
	errors?: QueryError[];
}
