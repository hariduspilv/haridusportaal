import { QueryError } from '@app/_core/models/interfaces/main';
import { Study } from './study';

export interface StudyListViewQueryResponse {
	count: number;
	entities: Study[];
	errors?: QueryError[];
}
