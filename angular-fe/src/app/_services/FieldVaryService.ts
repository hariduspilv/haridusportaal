const requestMap = {
  nid: ['entityId'],
  alert: ['fieldAlert'],
  support: ['fieldSupport'],
  tags: ['fieldArticleTags', 'fieldNewsTags', 'fieldTag', 'fieldMainProfessionTag', 'hashTags'],
  accordion: ['fieldNewsAccordion', 'fieldInfosystemAccordion', 'fieldMainProfessionAccordion', 'fieldOskaFieldAccordion', 'fieldSurveyPageAccordion', 'fieldAccordionSection'],
  shortDescription: ['fieldShortDescription', 'fieldDescriptionSummary', 'fieldIntroduction', 'fieldBodySummary'],
  introductionText: ['fieldIntroductionText', 'fieldResultPageIntroduction', 'fieldSurveyPageIntroduction'],
  content: ['fieldContentText', 'fieldServiceContent', 'fieldLearningCarouselContent', 'fieldContent'],
  image: ['fieldIntroductionImage', 'fieldLogo', 'fieldPicture', 'fieldMainProfessionPicture', 'fieldOskaFieldPicture', 'fieldSurveyPagePicture', 'fieldImage', 'fieldResultPagePicture', 'fieldServiceImage', 'fieldLearningCarouselImage', 'fieldToolboxImage'],
  description: ['fieldNewsDescription', 'fieldDescription', 'body', 'fieldBody'],
  duration: ['fieldDuration', 'FieldDuration'],
  title: ['entityLabel', 'FieldSchoolName', 'fieldServiceTitle', 'fieldLearningCarouselTitle', 'fieldTitle'],
  head: ['fieldStudyProgrammeLevel', 'FieldStudyProgrammeLevel', 'FieldEducationalInstitutionTy', 'contentType'],
  educationalInstitution: ['fieldEducationalInstitution'],
  address: ['fieldAddress', 'FieldAddress'],
  teachingLanguage: ['fieldTeachingLanguage', 'FieldTeachingLanguage'],
  specialClass: ['fieldSpecialClass'],
  studentHome: ['fieldStudentHome'],
  phone: ['FieldSchoolContactPhone', 'fieldSchoolContactPhone', 'fieldPhone', 'fieldContactPhone', 'fieldFrontpageContactPhone'],
  email: ['FieldSchoolContactEmail', 'fieldSchoolContactEmail', 'fieldEmail', 'fieldContactEmail', 'fieldFrontpageContactEmail'],
  news: ['fieldTeachingNews', 'fieldLearningNews', 'fieldFrontpageNews'],
  webpage: ['FieldSchoolWebpageAddress', 'fieldSchoolWebpageAddress', 'fieldWebpageLink', 'fieldSchoolWebpageAddress'],
  url: ['entityUrl', 'EntityPath', 'entityPath' ],
  subtitle: ['fieldSubtitle'],
  sidebar: ['fieldInfosystemSidebar', 'fieldSidebar', 'fieldOskaFieldSidebar', 'fieldSurveyPageSidebar', 'fieldRightSidebar', 'fieldResultPageSidebar'],
  fixedLabel: ['fieldFixedLabel'],
  indicator: ['reverseOskaMainProfessionOskaIndicatorEntity'],
  fillingBar: ['reverseOskaMainProfessionOskaFillingBarEntity'],
  video: ['fieldNewsVideo', 'fieldOskaVideo', 'fieldSurveyPageVideo', 'fieldVideo', 'fieldEventVideo', 'fieldResultPageVideo', 'fieldOskaMainProfessionVideo'],
  videoThumb: ['fieldVideoThumbnail'],
  additionalImages: ['fieldAdditionalImages'],
  author: ['fieldAuthor'],
  person: ['fieldPerson', 'fieldContactPerson'],
  organizer: ['fieldOrganizer', 'fieldContactOrganizer', 'fieldOrganization', 'fieldContactOrganization'],
  links: ['fieldOskaMainProfessionLinks', 'fieldEventLink', 'fieldOskaWebPage', 'fieldNewsLink', 'fieldSurveyPageLink', 'fieldResultPageLinks'],
  group: ['fieldEventGroup'],
  attachmentFile: ['fieldOskaMainProfessionFile', 'fieldAttachmentFile', 'fieldOskaAttachmentFile', 'fieldSurveyPageAttachment', 'fieldFile', 'fieldResultPageFiles'],
  graph: ['fieldDynamicGraph'],
  infograph: ['fieldInfograph'],
  additional: ['fieldAdditional', 'fieldPracticalInformation'],
  fieldPros: ['fieldOskaFieldPros'],
  fieldCons: ['fieldOskaFieldCons'],
  admissionStatus: ['fieldAdmissionStatus', 'FieldAdmissionStatus', 'admissionStatus'],
  quoteAuthor: ['fieldQuoteAuthor', 'fieldLearningQuoteAuthor'],
  quoteText: ['fieldQuoteText', 'fieldLearningQuoteText', 'fieldFrontpageQuote'],
  quoteAuthorWork: ['fieldQuoteAuthorOccupation', 'fieldLearningQuoteWork'],
  contact: ['fieldLearningContact', 'fieldCareerContact'],
  topics: ['fieldFrontpageTopics', 'fieldTeachingThemes', 'fieldContentPageLink', 'fieldLearningContentLinks', 'fieldYouthThemesLinks'],
  name: ['fieldFrontpageContactName'],
  externalLinks: ['fieldExternalLinks', 'fieldLearningExternalLinks', 'fieldExternal'],
  services: ['fieldFrontpageServices', 'fieldLearningPath', 'fieldToolbox'],
  linkTitle: ['fieldLinkName', 'fieldLearnCarouselLinkTitle', 'fieldServiceLink'],
  link: ['fieldLearningCarouselLink', 'fieldServiceLink', 'fieldInternalLink'],
};


export default(data) => {
  const tmp = {};
  Object.keys(data).forEach((item) => {
    let match = false;
    Object.keys(requestMap).forEach((compare) => {
      if (requestMap[compare].indexOf(item) !== -1) {
        tmp[compare] = data[item];
        match = true;
      }
    });
    if (!match) {
      tmp[item] = data[item];
    }
  });
  return tmp;
};
