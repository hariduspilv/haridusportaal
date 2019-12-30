
export const queryList = {
  news: 'newsList',
  studyprogramme: 'studyProgrammeList',
  school: 'schoolMapQuery',
  mainprofession: 'oskaMainProfessionListView',
  homesearch: 'homeSearchRevised',
};

export const likeFields = {
  news: ['title', 'school', 'location'],
  studyprogramme: ['title', 'school', 'location'],
  mainprofession: ['title'],
};

export const searchResultKeys = {
  news: {
    title: {
      key: 'titleValue',
      enabled: 'titleEnabled',
    },
    tag: {
      key: 'tagValue',
      enabled: 'tagEnabled',
    },
  },
  studyprogramme: {
    title: {
      key: 'title',
      enabled: 'titleEnabled',
    },
    school: {
      key: 'school',
      enabled: 'schoolEnabled',
    },
    location: {
      key: 'location',
      enabled: 'locationEnabled',
    },
    level: {
      key: 'level',
      enabled: 'levelEnabled',
    },
    type: {
      key: 'type',
      enabled: 'typeEnabled',
      type: 'string',
    },
    language: {
      key: 'language',
      enabled: 'languageEnabled',
    },
    iscedf_broad: {
      key: 'iscedf_broad',
      enabled: 'iscedf_broadEnabled',
    },
    iscedf_narrow: {
      key: 'iscedf_narrow',
      enabled: 'iscedf_narrowEnabled',
    },
    iscedf_detailed: {
      key: 'iscedf_detailed',
      enabled: 'iscedf_detailedEnabled',
    },
    onlyOpenAdmission: {
      key: 'onlyOpenAdmission',
      enabled: 'onlyOpenAdmission',
    },
    sort: {
      key: 'sortField',
      enabled: 'indicatorSort',
    },
    sortDirection: {
      key: 'sortDirection',
    },
  },
  school: {
    bounds: {
      key: 'bounds',
      enabled: 'boundsEnabled',
    },
    location: {
      key: 'location',
      enabled: 'locationEnabled',
    },
    type: {
      key: 'type',
      enabled: 'typeEnabled',
    },
    language: {
      key: 'language',
      enabled: 'languageEnabled',
    },
    ownership: {
      key: 'ownership',
      enabled: 'ownershipEnabled',
    },
    specialClass: {
      key: 'specialClass',
      enabled: 'specialClassEnabled',
    },
    studentHome: {
      key: 'studentHome',
      enabled: 'studentHomeEnabled',
    },
  },
  mainprofession: {
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
  },
  homesearch: {
    searchTerm: {
      key: 'search_term',
      enabled: 'searchTermEnabled',
    },
  },
};

export const requiredFields = {
  news: ['tag', 'title', 'minDate', 'maxDate'],
  // tslint:disable-next-line: max-line-length
  studyprogramme: [
    'title',
    'school',
    'location',
    'level',
    'type',
    'language',
    'iscedf_broad',
    'iscedf_narrow',
    'iscedf_detailed',
    'sortField',
    'sortDirection',
    'onlyOpenAdmission',
  ],
  school: [
    'title',
    'bounds',
    'minLat',
    'maxLat',
    'minLon',
    'maxLon',
    'location',
    'type',
    'language',
    'ownership',
    'specialClass',
    'studentHome',
  ],
  mainprofession: [
    'title',
    'oskaField',
    'fixedLabel',
    'fillingBar',
    'sortField',
    'sortDirection',
    'nidEnabled',
  ],
  homesearch: [
    'searchTerm',
  ],
};

export const defaultValues = {
  studyprogramme: {
    sortField: 'title',
    sortDirection: 'ASC',
    onlyOpenAdmission: true,
  },
  school: {
    minLat: '0',
    maxLat: '99',
    minLon: '0',
    maxLon: '99',
  },
  mainprofession: {
    sortField: 'title',
    sortDirection: 'ASC',
  },
};

export const multiSelectFields = {
  school: [
    'type',
    'language',
    'ownership',
  ],
  studyprogramme: [
    'level',
    'iscedf_broad',
    'iscedf_narrow',
    'iscedf_detailed',
  ],
  news: [
    'tagValue',
  ],
  mainprofession: [
    'fillingBarValues',
    'oskaFieldValue',
    'fixedLabelValue',
  ],
};
