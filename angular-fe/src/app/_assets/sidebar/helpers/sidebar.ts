// tslint:disable
export const collection = {
  'nodeQuery': 'articles',
  'newsQuery': 'news',
  'fieldContact': 'contact',
  'fieldContactSection': 'contact',
  'fieldOskaFieldContact': 'contact',
  'educationalInstitution': 'contact',
  // 'fieldIscedfSearchLink': 'links',
  'fieldJobOpportunities': 'links',
  'fieldLearningOpportunities': 'links',
  'fieldJobs': 'links',
  'fieldOskaField': 'links',
  'fieldQualificationStandard': 'links',
  'fieldOskaResults': 'links',
  'fieldQuickFind': 'links',
  'fieldOskaFieldQuickFind': 'links',
  'fieldRelatedArticle': 'links',
  'fieldRelatedPages': 'links',
  'fieldHyperlinks': 'links',
  'prosCons': 'categories',
  'additional': 'data',
  'fieldRegistration': 'register',
  'fieldRegistration2': 'register',
  'fieldButton': 'actions',
  'fieldEhisLinks': 'actions',
  'fieldSchoolLocation': 'location',
  'fieldEventLocation': 'location',
  'indicator': 'facts',
  'fillingBar': 'progress',
  'favourites': 'links',
  'fieldLegislationBlock': 'links',
  'links': 'links',
  'event': 'events',
  'fieldBlocks': 'links',
  'notifications': 'notifications',
  'gdpr': 'gdpr',
}

export const uniformTypes = {
  'prosCons': ['fieldPros', 'fieldNeutral', 'fieldCons', 'fieldOskaFieldPros', 'fieldOskaFieldCons'],
  'fieldContact': ['email', 'person', 'phone', 'organizer', 'webpage'],
  'fieldEventLocation': [
    'fieldEventLocation',
    'fieldEventLocationLink',
    'fieldEventDate',
    'fieldEventMainDate',
    'fieldEventMainEndDate',
    'fieldEventMainStartTime',
    'fieldEventMainEndTime'
  ],
  'fieldSchoolLocation': [
    'educationalInstitution'
  ],
  'fieldRegistration': [
    'fieldEntryType',
    'fieldRegistrationDate',
    'EventRegistrations',
    'fieldRegistrationUrl',
  ]
}

export const titleLess = {
  'contact': false,
  'links': false,
  'prosCons': false,
  'data': true,
  'register': true,
  'actions': true,
  'facts': false,
  'progress': false,
  'articles': false,
  'location': true,
  'event': false,
};

export const parseInfosystemData = (inputData) => {
  inputData['fieldEhisLinks'] = inputData['fieldEhisLinks'].map((val) => {
    const object = val.entity.fieldEhisLink;
    object.icon = val.entity.fieldLinkIcon;
    return object;
  });
  return inputData;
}

export const parseProfessionData = (inputData, translate) => {
  let mappedData = inputData;
  try {
    let searchParams = {
      open_admission: true,
    };
    try {
      const iDetailed = mappedData['fieldIscedfSearchLink']
      ['entity']['iscedf_detailed'].map((val) => {
        return val.entity.entityId;
      });
      searchParams['iscedf_detailed'] = iDetailed.join(';');
    } catch (err) { }

    try {
      const iNarrow = mappedData['fieldIscedfSearchLink']
      ['entity']['iscedf_narrow'].map((val) => {
        return val.entity.entityId;
      });
      searchParams['iscedf_narrow'] = iNarrow.join(';');
    } catch (err) { }

    try {
      const iBroad = mappedData['fieldIscedfSearchLink']
      ['entity']['iscedf_broad'].map((val) => {
        return val.entity.entityId;
      });
      searchParams['iscedf_broad'] = iBroad.join(';');
    } catch (err) { }

    try {
      const iLevel = mappedData['fieldIscedfSearchLink']['entity']['level'].map((val) => {
        return val.entity ? val.entity.entityId : false;
      }).filter((val) => {
        return val;
      });
      searchParams['level'] = iLevel.join(';');
    } catch (err) {
      console.log(err);
    }

    mappedData['fieldLearningOpportunities'] = [
      {
        title: translate.get('professions.go_to_subjects'),
        url: {
          path: `/erialad`,
          params: searchParams,
          routed: true,
        },
      },
    ];


  } catch (err) { }

  try {
    mappedData['fieldOskaField'] = mappedData['fieldOskaField'].map((item) => {
      return {
        title: item.entity.entityLabel,
        url: item.entity.entityUrl,
      };
    });
  } catch (err) { }

  try {
    mappedData['fieldJobs'] = mappedData['fieldJobs'].map((item) => {
      return {
        title: item.entity.fieldJobName,
        url: item.entity.fieldJobLink || '',
      };
    });
  } catch (err) {
  }

  try {
    if (!mappedData['fieldQuickFind']) {
      mappedData['fieldQuickFind'] = [];
    }
    const additionalData = [
      {
        title: 'Ametialade andmed',
        url: {
          path: '/ametialad/andmed',
          routed: true,
        },
      },
      {
        title: 'Kõik ametialad',
        url: {
          path: '/ametialad',
          routed: true,
        },
      },
    ];

    additionalData.forEach((item) => {
      let match = false;
      mappedData['fieldQuickFind'].forEach((link) => {
        if (link.title === item.title) {
          match = true;
        }
      });
      if (!match) {
        mappedData['fieldQuickFind'].unshift(item);
      }
    });
  } catch (err) { }

  try {
    if (!mappedData['indicator'].entities.length) {
      delete mappedData['indicator'];
    }
  } catch (err) { }

  try {
    if (!mappedData['fillingBar'].entities.length) {
      delete mappedData['fillingBar'];
    }
  } catch (err) { }

  mappedData = getIndicators(mappedData);

  try {
    delete mappedData['links'];
  } catch (err) { }

  try {
    if (!mappedData['fieldContact']['entity']['fieldEmail'] &&
      !mappedData['fieldContact']['entity']['fieldPerson'] &&
      !mappedData['fieldContact']['entity']['fieldPhone']) {
      delete mappedData['fieldContact'];
    }
  } catch (err) { }


  return mappedData;
}


const getFieldNumberEmployedIcon = (val) => {
  if (val < 10000) {
    return 1
  } else if (val >= 10000 && val < 15000) {
    return 2
  } else if (val >= 15000 && val < 20000) {
    return 3
  } else if (val >= 20000 && val < 25000) {
    return 4
  } else if (val >= 25000 && val < 30000) {
    return 5
  } else if (val >= 30000 && val < 35000) {
    return 6
  } else if (val >= 35000 && val < 45000) {
    return 7
  } else if (val >= 45000 && val < 55000) {
    return 8
  } else if (val >= 55000 && val < 65000) {
    return 9
  } else if (val >= 65000 && val < 75000) {
    return 10
  } else {
    return 11;
  }
}

const getIndicators = (mappedData) => {
  try {
    const indicators = { entities: [] };
    let hasFieldNumberEmployed = false;
    if (mappedData.fieldNumberEmployed) {
      indicators['entities'].push({
        oskaId: 1,
        value: mappedData.fieldNumberEmployed,
        oskaIndicator: "Hõivatute arv",
        icon: getFieldNumberEmployedIcon(mappedData.fieldNumberEmployed),
      })
      hasFieldNumberEmployed = true;
    }
    if (mappedData.fieldEmploymentChange && hasFieldNumberEmployed) {
      indicators['entities'].push({
        oskaId: 2,
        value: mappedData.fieldEmploymentChange,
        oskaIndicator: "Hõive muutus",
        icon: mappedData.fieldEmploymentChange,
      });
    }

    if (indicators.entities.length) {
      mappedData['indicator'] = indicators;
    }
  } catch (err) { }

  return mappedData;
}

export const parseFieldData = (inputData, translate) => {
  let mappedData = inputData;
  console.log(mappedData)
  mappedData['fieldOskaResults'] = [{
    title: translate.get('oska.go_to_results'),
    url: {
      path: '/oska-tulemused/ettepanekute-elluviimine',
      routed: true,
    }
  }];

  try {

    if (!mappedData['fieldQuickFind']) {
      mappedData['fieldQuickFind'] = [];
    }
    const additionalData = [
      {
        title: 'Valdkondade andmed',
        url: {
          path: '/valdkonnad/andmed',
          routed: true,
        },
      },
      {
        title: 'Kõik valdkonnad',
        url: {
          path: '/valdkonnad',
          routed: true,
        },
      },
    ];

    additionalData.forEach((item) => {
      let match = false;
      mappedData['fieldQuickFind'].forEach((link) => {
        if (link.title === item.title) {
          match = true;
        }
      });
      if (!match) {
        mappedData['fieldQuickFind'].unshift(item);
      }
    });
  } catch (err) { }

  if (mappedData.links) {
    mappedData['fieldQuickFind'] = [...mappedData['fieldQuickFind'], ...mappedData.links];
    delete mappedData.links;
  }

  if (mappedData['fieldOskaFieldQuickFind']) {
    mappedData['fieldQuickFind'] = [...mappedData['fieldQuickFind'], ...mappedData['fieldOskaFieldQuickFind']];
    delete mappedData['fieldOskaFieldQuickFind'];
  }

  mappedData = getIndicators(mappedData);

  try {
    if (!mappedData['fieldOskaFieldContact']['entity']['fieldEmail'] &&
      !mappedData['fieldOskaFieldContact']['entity']['fieldPerson'] &&
      !mappedData['fieldOskaFieldContact']['entity']['fieldPhone']) {
      delete mappedData['fieldOskaFieldContact'];
    }
  } catch (err) { }

  return mappedData;
}