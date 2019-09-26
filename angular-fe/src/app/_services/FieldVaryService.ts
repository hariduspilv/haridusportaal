// tslint:disable
const requestMap = {
  tags: ['fieldArticleTags', 'fieldNewsTags', 'fieldTag', 'fieldMainProfessionTag'],
  accordion: ['fieldNewsAccordion', 'fieldInfosystemAccordion', 'fieldMainProfessionAccordion', 'fieldOskaFieldAccordion', 'fieldSurveyPageAccordion', 'fieldAccordionSection'],
  shortDescription: ['fieldShortDescription', 'fieldDescriptionSummary', 'fieldIntroduction', 'fieldBodySummary'],
  introductionText: ['fieldIntroductionText'],
  content: ['fieldContentText'],
  image: ['fieldIntroductionImage', 'fieldLogo', 'fieldPicture', 'fieldMainProfessionPicture', 'fieldOskaFieldPicture', 'fieldSurveyPagePicture', 'fieldImage'],
  description: ['fieldNewsDescription', 'fieldDescription', 'body', 'fieldBody'],
  duration: ['fieldDuration'],
  title: ['entityLabel', 'FieldSchoolName'],
  head: ['fieldStudyProgrammeLevel', 'FieldEducationalInstitutionTy'],
  educationalInstitution: ['fieldEducationalInstitution'],
  address: ['fieldAddress', 'FieldAddress'],
  teachingLanguage: ['fieldTeachingLanguage'],
  specialClass: ['fieldSpecialClass'],
  studentHome: ['fieldStudentHome'],
  phone: ['FieldSchoolContactPhone'],
  email: ['FieldSchoolContactEmail'],
  webpage: ['FieldSchoolWebpageAddress', 'fieldWebpageLink'],
  url: ['entityUrl', 'EntityPath'],
  subtitle: ['fieldSubtitle'],
  sidebar: ['fieldInfosystemSidebar', 'fieldSidebar', 'fieldOskaFieldSidebar', 'fieldSurveyPageSidebar', 'fieldRightSidebar'],
  fixedLabel: ['fieldFixedLabel'],
  indicator: ['reverseOskaMainProfessionOskaIndicatorEntity'],
  fillingBar: ['reverseOskaMainProfessionOskaFillingBarEntity'],
  video: ['fieldNewsVideo', 'fieldOskaMainProfessionVideo', 'fieldOskaVideo', 'fieldSurveyPageVideo', 'fieldVideo'],
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
