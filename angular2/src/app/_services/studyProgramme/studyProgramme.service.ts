import gql from 'graphql-tag';


export const ListQuery = gql`
query(
    $lang: LanguageId!,
    $offset: Int,
    $limit: Int) {
    nodeQuery(offset: $offset, limit: $limit, sort: {field: "title", direction: ASC},
        filter: {
        conjunction: AND,
        conditions: [
          {operator: EQUAL, field: "type", value: ["study_programme"], language: $lang}
        ]
      }
    ) {
      entities(language:$lang) {
        ... on NodeStudyProgramme {
          nid
          entityLabel
          fieldTeachingLanguage {
            entity {
              entityLabel
            }
          }
          fieldStudyProgrammeType {
            entity {
              entityLabel
            }
          }
          fieldDurationYears
          fieldAdmissionStatus
                  fieldAccreditationStatus
          fieldStudyProgrammeLevel {
            entity {
              entityLabel
            }
          }
          fieldIscedfDetailed {
            entity {
              entityLabel
            }
          }
        }
      }
    }
  }
`;

export const SchoolStudyProgrammes = gql`
  query($lang: LanguageId!, $schoolId: String!) {
    nodeQuery(
      filter: {
        conditions: {
          field: "field_educational_institution"
          value: [$schoolId]
          language: $lang
        }
      }
      sort: [{
        field: "title"
        direction: ASC
      }]
    ) {
      entities(language:$lang) {
        ... on NodeStudyProgramme {
          title
          fieldSchoolAddress
          fieldSchoolWebsite
          fieldStudyProgrammeType {
            entity {
              name
            }
          }
          fieldStudyProgrammeLevel {
            entity {
              name
            }
          }
          fieldTeachingLanguage {
            entity {
              name
            }
          }
          fieldIscedfDetailed {
            entity {
              name
            }
          }
          fieldAccreditationStatus
          fieldDurationYears
          fieldDurationMonths
          fieldAdmissionStatus
        }
      }
    }
  }
`;