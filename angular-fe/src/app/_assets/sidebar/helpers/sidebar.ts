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
  'fieldQuickFind': 'links',
  'fieldOskaFieldQuickFind' : 'links',
  'fieldRelatedArticle': 'links',
  'fieldRelatedPages': 'links',
  'fieldHyperlinks': 'links',
  'prosCons': 'categories',
  'additional': 'data',
  'fieldRegistration': 'register',
  'fieldRegistration2': 'register',
  'fieldButton': 'actions',
  'fieldSchoolLocation': 'location',
  'fieldEventLocation': 'location',
  'indicator': 'facts',
  'fillingBar': 'progress',
  'favourites': 'links',
  'fieldLegislationBlock': 'links',
  'links': 'links',
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
  'data': false,
  'register': false,
  'actions': true,
  'facts': false,
  'progress': false,
  'articles': false,
  'location': true,
};