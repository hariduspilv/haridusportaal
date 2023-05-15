export const likeFields = ['title'];

export const searchResultKeys = {
	title: {
		key: 'titleValue',
		enabled: 'titleEnabled',
	},
	oskaField: {
		key: 'oskaFieldValue',
		enabled: 'oskaFieldEnabled',
	},
	fixedLabel: {
		key: 'fixedLabelValue',
		enabled: 'fixedLabelEnabled',
	},
	fillingBar: {
		key: 'fillingBarValues',
		enabled: 'fillingBarFilterEnabled',
	},
	sortField: {
		key: 'sortField',
		enabled: 'indicatorSort',
	},
	sortDirection: {
		key: 'sortDirection',
	},
	nidEnabled: {
		key: 'nidEnabled',
		enabled: 'nidEnabled',
	},
	fieldProfession: {
		key: 'fieldProfession',
		enabled: 'fieldProfessionEnabled',
	},
};

export const requiredFields = [
	'title',
	'oskaField',
	'fixedLabel',
	'fillingBar',
	'sortField',
	'sortDirection',
	'nidEnabled',
	'limit',
	'offset',
	'lang',
	'fieldProfession',
];

export const defaultValues = {
	sortField: 'title',
	sortDirection: 'ASC',
	limit: 24,
	offset: 0,
};

export const multiSelectFields = [
	'fillingBarValues',
	'oskaFieldValue',
	'fixedLabelValue',
	'language',
];
