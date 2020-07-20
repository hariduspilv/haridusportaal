const findObj = (obj, path) => {
  return path
  .replace(/\[|\]\.?/g, '.')
  .split('.')
  .filter(s => s)
  .reduce((acc, val) => acc && acc[val], obj);
};

const monthsToYears = (value) => {
  const monthOverflow = value % 12;
  const years = Math.floor(value / 12);
  if (monthOverflow === 1 && years === 1) {
    return `${years} aasta ${monthOverflow} kuu`;
  }
  if (monthOverflow > 1 && years === 1) {
    return `${years} aasta ${monthOverflow} kuud`;
  }
  if (monthOverflow > 1 && years > 1) {
    return `${years} aastat ${monthOverflow} kuud`;
  }
  if (monthOverflow === 0 && years > 1) {
    return `${years} aastat`;
  }
  if (monthOverflow > 0 && years === 0) {
    return `${monthOverflow} kuud`;
  }
  return `${years} aasta`;
};

export const parseData = (data) => {
  const tableValues = [
    {
      key: 'fieldEducationalInstitution.entity.entityLabel',
      label: 'school.institution_name',
    },
    {
      key: 'fieldEducationalInstitution.entity.fieldRegistrationCode',
      label: 'school.register_code',
    },
    {
      key: 'fieldStudyProgrammeLevel',
      label: 'studyProgramme.level',
    },
    {
      key: 'fieldDegreeOrDiplomaAwarded.entity.entityLabel',
      label: 'studyProgramme.degree_or_diploma',
    },
    {
      key: 'fieldSpecialization',
      label: 'studyProgramme.specialization',
    },
    {
      key: 'fieldIscedfBoard.entity.entityLabel',
      label: 'studyProgramme.filter_iscedf_broad',
    },
    {
      key: 'fieldIscedfNarrow.entity.entityLabel',
      label: 'studyProgramme.filter_iscedf_narrow',
    },
    {
      key: 'fieldIscedfDetailed.entity.entityLabel',
      label: 'studyProgramme.filter_iscedf_detailed',
    },
    {
      key: 'fieldShortDescription',
      label: 'studyProgramme.introduction',
    },
    {
      key: 'fieldTeachingLanguage',
      label: 'studyProgramme.languages',
    },
    {
      key: 'fieldAmount',
      label: 'studyProgramme.study_capacity',
      join: 'fieldAmountUnit',
    },
    {
      key: 'fieldPracticalTrainingAmount',
      label: 'studyProgramme.internship_capacity',
      join: 'fieldAmountUnit',
    },
    {
      key: 'fieldDuration',
      label: 'studyProgramme.nominal_time',
      transform: 'toYears',
    },
    {
      key: 'fieldAdmissionStatus',
      label: 'studyProgramme.admission_status',
    },
    {
      key: 'fieldWebPageAddress.uri',
      label: 'studyProgramme.describing_website',
      transform: 'link',
      linkLabel: 'Vaata õppekava kirjeldust õppeasutuse veebilehel',
    },
    {
      key: 'fieldQualificationStandardId',
      label: 'studyProgramme.qualification_standards',
    },
  ].map((item) => {
    let value: any = findObj(data, item.key);

    if (Array.isArray(value) && value.length > 0) {
      const existingValues = [];
      value = value.filter((item) => {
        if (!existingValues.includes(item.entity.entityLabel)) {
          existingValues.push(item.entity.entityLabel);
          return item;
        }
      }).map((item) => {
        return item['entity']['entityLabel'];
      }).map((item:string) => {
        return item.charAt(0).toUpperCase() + item.slice(1);
      }).join(', ');
    }

    if (item.join && value !== null && value !== '0' && value) {
      value = `${value} ${findObj(data, item.join)}`;
    }

    switch (item.transform) {
      case 'toYears': {
        value = monthsToYears(value);
        break;
      }
      case 'link': {
        if (value) {
          value = `<a href="${value}">${item.linkLabel}</a>`;
        }
        break;
      }
    }
    if (item.transform) {
    }

    if (value) {
      return {
        value,
        ... item,
      };
    }
  }).filter((item:any) => {
    let output = item;
    if (output) {
      if (Array.isArray(output.value) && output.value.length === 0) {
        output = false;
      }
    }

    return output || false;
  });

  return tableValues;

};
