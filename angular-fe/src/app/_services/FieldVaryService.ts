// tslint:disable
const requestMap = {
  tags: ['fieldArticleTags', 'fieldNewsTags', 'fieldTag', 'fieldMainProfessionTag'],
  accordion: ['fieldNewsAccordion', 'fieldInfosystemAccordion', 'fieldMainProfessionAccordion', 'fieldOskaFieldAccordion', 'fieldSurveyPageAccordion'],
  shortDescription: ['fieldShortDescription', 'fieldDescriptionSummary', 'fieldIntroduction'],
  introductionText: ['fieldIntroductionText'],
  content: ['fieldContentText'],
  image: ['fieldIntroductionImage', 'fieldLogo', 'fieldPicture', 'fieldMainProfessionPicture', 'fieldOskaFieldPicture', 'fieldSurveyPagePicture'],
  description: ['fieldNewsDescription', 'fieldDescription', 'body'],
  duration: ['fieldDuration'],
  title: ['entityLabel', 'FieldSchoolName'],
  head: ['fieldStudyProgrammeLevel', 'FieldEducationalInstitutionTy'],
  educationalInstitution: ['fieldEducationalInstitution'],
  address: ['fieldAddress', 'FieldAddress'],
  teachingLanguage: ['fieldTeachingLanguage'],
  phone: ['FieldSchoolContactPhone'],
  email: ['FieldSchoolContactEmail'],
  webpage: ['FieldSchoolWebpageAddress', 'fieldWebpageLink'],
  url: ['entityUrl', 'EntityPath'],
  subtitle: ['fieldSubtitle'],
  sidebar: ['fieldInfosystemSidebar', 'fieldSidebar', 'fieldOskaFieldSidebar', 'fieldSurveyPageSidebar'],
  fixedLabel: ['fieldFixedLabel'],
  indicator: ['reverseOskaMainProfessionOskaIndicatorEntity'],
  fillingBar: ['reverseOskaMainProfessionOskaFillingBarEntity'],
  video: ['fieldNewsVideo', 'fieldOskaMainProfessionVideo', 'fieldOskaVideo', 'fieldSurveyPageVideo'],
  additionalImages: ['fieldAdditionalImages'],
  author: ['fieldAuthor'],
  links: ['fieldOskaMainProfessionLinks', 'fieldEventLink', 'fieldOskaWebPage', 'fieldNewsLink', 'fieldSurveyPageLink'],
  group: ['fieldEventGroup'],
  attachmentFile: ['fieldOskaMainProfessionFile', 'fieldAttachmentFile', 'fieldOskaAttachmentFile', 'fieldSurveyPageAttachment'],
  graph: ['fieldDynamicGraph'],
};
// tslint:enable
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
