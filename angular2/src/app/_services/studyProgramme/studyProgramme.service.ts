import gql from 'graphql-tag';


export const ListQuery = gql`
query studyProgrammeList (
  $lang: LanguageId!,
  $offset: Int,
  $limit: Int,
  $title: String,
  $filterOptions: {},
  $searchStudyProgrammeType: [String],
  $searchStudyProgrammeTypeEnabled: Boolean) {
  nodeQuery(offset: $offset, limit: $limit, sort: {field: "title", direction: ASC},
      filter: {
      conjunction: AND,
      conditions: [
        {operator: LIKE, field: "title", value: [$title], language: $lang}
        {operator: IN, field: "field_study_programme_level", value: $filterOptions.level.value, language: $lang, enabled: $filterOptions.level.enabled}
        {operator: IN, field: "field_study_programme_type", value: $searchStudyProgrammeType, language: $lang, enabled: $searchStudyProgrammeTypeEnabled}
        {operator: EQUAL, field: "type", value: ["study_programme"], language: $lang}
      ]
    }
  ) {
    entities(language:$lang) {
      ... on NodeStudyProgramme {
        nid
        entityLabel
        fieldEducationalInstitution {
          entity{
            entityLabel
            entityId
          }
        }
        fieldTeachingLanguage {
          entity {
            entityLabel
          }
        }
        fieldStudyProgrammeType {
          entity {
            tid
            entityLabel
          }
        }
        fieldDurationYears
        fieldDurationMonths
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

export const FilterOptions = gql`
query studyProgrammeFilterOptions( $lang: LanguageId!){
  type: taxonomyTermQuery(filter: {conditions: [
    {operator: EQUAL, field: "vid", value: ["studyprogrammetype"], language: $lang}
  	]}) {
    entities{
      ... on TaxonomyTerm {
        tid
        entityLabel
        reverseFieldStudyProgrammeTypeNode{
          count
        }
      }
    }
  }
  level: taxonomyTermQuery(filter: {conditions: [
    
    {operator: EQUAL, field: "vid", value: ["studyprogrammelevel"], language: $lang}
  	]}) {
    entities{
      ... on TaxonomyTerm {
        tid
        entityLabel
        reverseFieldStudyProgrammeLevelNode{
          count
        }
      }
    }
  }
  language: taxonomyTermQuery(filter: {conditions: [
    
    {operator: EQUAL, field: "vid", value: ["teaching_language"], language: $lang}
  	]}) {
    entities{
      ... on TaxonomyTerm {
        tid
        entityLabel
        reverseFieldTeachingLanguageNode{
          count
        }
      }
    }
  }
  school : nodeQuery(offset: 0, limit: 50, sort: {field: "title", direction: ASC}, filter: {conditions: [
    {operator: EQUAL, field: "type", value: ["school"], language: $lang}
  	]}) {
    entities{
      ... on NodeSchool {
        nid
        entityLabel
      }
    }
  }
  location: taxonomyTermQuery(filter: {conditions: [
    {operator: EQUAL, field: "vid", value: ["educational_institution_location"], language: $lang}
  	]}) {
    entities{
      ... on TaxonomyTerm {
        tid
        entityLabel
      }
    }
  }
}
`;