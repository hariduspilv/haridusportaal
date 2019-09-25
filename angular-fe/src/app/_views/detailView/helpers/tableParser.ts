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
      label: 'Õppeasutuse nimi',
    },
    {
      key: 'fieldEducationalInstitution.entity.fieldRegistrationCode',
      label: 'Registrikood',
    },
    {
      key: 'fieldStudyProgrammeLevel.entity.entityLabel',
      label: 'Õppekava tase',
    },
    {
      key: 'fieldDegreeOrDiplomaAwarded.entity.entityLabel',
      label: 'Omistatav kraad või diplom',
    },
    {
      key: 'fieldSpecialization',
      label: 'Spetsialiseerumine',
    },
    {
      key: 'fieldIscedfBoard.entity.entityLabel',
      label: 'Õppevaldkond',
    },
    {
      key: 'fieldIscedfNarrow.entity.entityLabel',
      label: 'Õppesuund',
    },
    {
      key: 'fieldIscedfDetailed.entity.entityLabel',
      label: 'Õppekavarühm',
    },
    {
      key: 'fieldShortDescription',
      label: 'Lühikirjeldus',
    },
    {
      key: 'fieldTeachingLanguage',
      label: 'Õppekeel(ed)',
    },
    {
      key: 'fieldAmount',
      label: 'Õppekava maht',
      join: 'fieldAmountUnit',
    },
    {
      key: 'fieldPracticalTrainingAmount',
      label: 'Praktika maht',
      join: 'fieldAmountUnit',
    },
    {
      key: 'fieldDuration',
      label: 'Nominaalkestus',
      transform: 'toYears',
    },
    {
      key: 'fieldAdmissionStatus',
      label: 'Vastuvõtu olek',
    },
    {
      key: 'fieldWebPageAddress.uri',
      label: 'Õppekava kirjeldava veebilehe aadress',
      transform: 'link',
      linkLabel: 'Vaata õppekava kirjeldust õppeasutuse veebilehel',
    },
    {
      key: 'fieldQualificationStandardId',
      label: 'Kutsestandard(id)',
    },
  ].map((item) => {
    let value: any = findObj(data, item.key);

    if (Array.isArray(value) && value.length > 0) {
      value = value.map((item) => {
        return item['entity']['entityLabel'];
      }).map((item:string) => {
        return item.charAt(0).toUpperCase() + item.slice(1);
      }).join(', ');
    }

    if (item.join) {
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
