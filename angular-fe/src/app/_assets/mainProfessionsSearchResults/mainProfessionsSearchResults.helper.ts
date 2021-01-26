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
];

export const defaultValues = {
  sortField: 'title',
  sortDirection: 'ASC',
  limit: 100,
  offset: 0,
  lang: 'ET',
};

export const multiSelectFields = [
  'fillingBarValues',
  'oskaFieldValue',
  'fixedLabelValue',
  'language',
];
