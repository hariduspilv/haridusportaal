
export const queryList = {
  news: 'newsList',
  studyprogramme: 'studyProgrammeList',
  school: 'schoolMapQuery',
};

export const likeFields = {
  news: ['title', 'school', 'location'],
  studyprogramme: ['title', 'school', 'location'],
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
};

export const defaultValues = {
  studyprogramme: {
    sortField: 'title',
    sortDirection: 'ASC',
  },
  school: {
    minLat: '0',
    maxLat: '99',
    minLon: '0',
    maxLon: '99',
  },
};

export const multiSelectFields = {
  school: [
    'type',
    'language',
    'ownership',
  ],
};
