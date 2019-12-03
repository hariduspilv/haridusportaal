// tslint:disable
const requestMap = {
  tags: ['fieldArticleTags', 'fieldNewsTags', 'fieldTag', 'fieldMainProfessionTag'],
  accordion: ['fieldNewsAccordion', 'fieldInfosystemAccordion', 'fieldMainProfessionAccordion', 'fieldOskaFieldAccordion', 'fieldSurveyPageAccordion', 'fieldAccordionSection'],
  shortDescription: ['fieldShortDescription', 'fieldDescriptionSummary', 'fieldIntroduction', 'fieldBodySummary'],
  introductionText: ['fieldIntroductionText', 'fieldResultPageIntroduction', 'fieldSurveyPageIntroduction'],
  content: ['fieldContentText'],
  image: ['fieldIntroductionImage', 'fieldLogo', 'fieldPicture', 'fieldMainProfessionPicture', 'fieldOskaFieldPicture', 'fieldSurveyPagePicture', 'fieldImage', 'fieldResultPagePicture'],
  description: ['fieldNewsDescription', 'fieldDescription', 'body', 'fieldBody'],
  duration: ['fieldDuration', 'FieldDuration'],
  title: ['entityLabel', 'FieldSchoolName'],
  head: ['fieldStudyProgrammeLevel', 'FieldStudyProgrammeLevel', 'FieldEducationalInstitutionTy', 'contentType'],
  educationalInstitution: ['fieldEducationalInstitution'],
  address: ['fieldAddress', 'FieldAddress'],
  teachingLanguage: ['fieldTeachingLanguage', 'FieldTeachingLanguage'],
  specialClass: ['fieldSpecialClass'],
  studentHome: ['fieldStudentHome'],
  phone: ['FieldSchoolContactPhone', 'fieldSchoolContactPhone', 'fieldPhone', 'fieldContactPhone'],
  email: ['FieldSchoolContactEmail', 'fieldSchoolContactEmail', 'fieldEmail', 'fieldContactEmail'],
  webpage: ['FieldSchoolWebpageAddress', 'fieldSchoolWebpageAddress', 'fieldWebpageLink', 'fieldSchoolWebpageAddress'],
  url: ['entityUrl', 'EntityPath', 'entityPath' ],
  subtitle: ['fieldSubtitle'],
  sidebar: ['fieldInfosystemSidebar', 'fieldSidebar', 'fieldOskaFieldSidebar', 'fieldSurveyPageSidebar', 'fieldRightSidebar', 'fieldResultPageSidebar'],
  fixedLabel: ['fieldFixedLabel'],
  indicator: ['reverseOskaMainProfessionOskaIndicatorEntity'],
  fillingBar: ['reverseOskaMainProfessionOskaFillingBarEntity'],
  video: ['fieldNewsVideo', 'fieldOskaVideo', 'fieldSurveyPageVideo', 'fieldVideo'],
  videoThumb: ['fieldVideoThumbnail'],
  additionalImages: ['fieldAdditionalImages'],
  additionalVideos: ['fieldResultPageVideo', 'fieldOskaMainProfessionVideo'],
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
