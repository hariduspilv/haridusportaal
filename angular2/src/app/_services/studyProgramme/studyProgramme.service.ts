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
`