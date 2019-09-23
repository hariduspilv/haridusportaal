
const requestMap = {
  tags: ['fieldArticleTags', 'fieldNewsTags', 'fieldTag'],
  accordion: ['fieldNewsAccordion', 'fieldInfosystemAccordion'],
  shortDescription: ['fieldShortDescription'],
  introductionText: ['fieldIntroductionText'],
  content: ['fieldContentText'],
  image: ['fieldIntroductionImage', 'fieldLogo'],
  description: ['fieldNewsDescription'],
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
  sidebar: ['fieldInfosystemSidebar', 'fieldSidebar'],
  fixedLabel: ['fieldFixedLabel'],
  indicator: ['reverseOskaMainProfessionOskaIndicatorEntity'],
  fillingBar: ['reverseOskaMainProfessionOskaFillingBarEntity'],
  video: ['fieldNewsVideo'],
  additionalImages: ['fieldAdditionalImages'],
  author: ['fieldAuthor'],
  link: ['fieldNewsLink'],
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
