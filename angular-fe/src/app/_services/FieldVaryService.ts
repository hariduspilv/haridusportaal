import { url } from 'inspector';

export class FieldVaryService {

  public newData;

  flattenFieldNames(data) {

    return data.map((item) => {
      const cleanedObject = {};

      for (const key in item) {
        const newKey = this.replaceKey(key);

        cleanedObject[newKey] = item[key];
      }
      return cleanedObject;
    });
  }

  replaceKey(key) {
    switch (key){
      case 'fieldTag':
        return 'tags';

      case 'fieldShortDescription':
        return 'shortDescription';

      case 'fieldIntroductionImage':
        return 'image';

      case 'fieldDuration':
        return 'duration';

      case 'entityLabel':
      case 'FieldSchoolName':
        return 'title';

      case 'fieldStudyProgrammeLevel':
      case 'FieldEducationalInstitutionTy':
        return 'head';

      case 'fieldEducationalInstitution':
        return 'educationalInstitution';

      case 'FieldAddress':
        return 'address';

      case 'fieldTeachingLanguage':
        return 'teachingLanguage';

      case 'FieldSchoolContactPhone':
        return 'phone';

      case 'FieldSchoolContactEmail':
        return 'email';

      case 'FieldSchoolWebpageAddress':
        return 'webpage';

      case 'entityUrl':
        return 'url';
    }
    return key;
  }

}
