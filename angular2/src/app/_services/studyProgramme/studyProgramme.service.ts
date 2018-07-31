import gql from 'graphql-tag';

const studyProgrammeListTestArgs = {
  "lang": "ET",
  "title": "%%",
  "limit": 10,
  "offset": 0,
  "type": ["1287"],
  "typeEnabled": false,
  "level": ["1290"],
  "levelEnabled": false,
  "location": "%rakvere%",
  "locationEnabled": true,
  "language": ["1296"],
  "languageEnabled": false,
  "school": "%tallinn%",
  "schoolEnabled": false,
  "iscedf_board": ["43379"],
  "iscedf_boardEnabled": false,
  "iscedf_narrow": ["43379"],
  "iscedf_narrowEnabled": false,
  "iscedf_detailed": ["43379"],
  "iscedf_detailedEnabled": false,
  "onlyOpenAdmission": false
}
export const ListQuery = gql`
query studyProgrammeList (
  $lang: LanguageId!,
  $offset: Int,
  $limit: Int,
  $title: String,
  $titleEnabled: Boolean,
  $location: String,
  $locationEnabled: Boolean,
  $type: [String],
  $typeEnabled: Boolean,
  $level: [String],
  $levelEnabled: Boolean,
	$language: [String],
  $languageEnabled: Boolean,
	$school: String,
  $schoolEnabled: Boolean,
	$iscedf_board: [String],
  $iscedf_boardEnabled: Boolean,
	$iscedf_narrow: [String],
  $iscedf_narrowEnabled: Boolean,
	$iscedf_detailed: [String],
  $iscedf_detailedEnabled: Boolean,
	$onlyOpenAdmission: Boolean) {
  nodeQuery(offset: $offset, limit: $limit, sort: {field: "title", direction: ASC},
      filter: {
      conjunction: AND,
      conditions: [
        {operator: LIKE, field: "title", value: [$title], language: $lang, enabled: $titleEnabled}
        {operator: LIKE, field:"field_school_address", value: [$location], language:$lang, enabled:$locationEnabled},
        {operator: LIKE, field:"field_educational_institution.entity.title", value: [$school], language: $lang enabled: $schoolEnabled},

        {operator: IN, field:"field_iscedf_board", value: $iscedf_board, language: $lang enabled: $iscedf_boardEnabled},
        {operator: IN, field:"field_iscedf_narrow", value: $iscedf_narrow, language: $lang enabled: $iscedf_narrowEnabled},
        {operator: IN, field:"field_iscedf_detailed", value: $iscedf_detailed, language: $lang enabled: $iscedf_detailedEnabled},
        {operator: EQUAL, field: "field_admission_status", value: "Avatud", language: $lang, enabled: $onlyOpenAdmission}
        {operator: IN, field:"field_teaching_language", value: $language, language: $lang enabled: $languageEnabled},
        {operator: IN, field: "field_study_programme_level", value: $level, language: $lang, enabled: $levelEnabled}
        {operator: IN, field: "field_study_programme_type", value: $type, language: $lang, enabled: $typeEnabled}
        {operator: EQUAL, field: "type", value: ["study_programme"], language: $lang}
      ]
    }
  ) {
    entities(language:$lang) {
      ... on NodeStudyProgramme {
        nid
        entityLabel
        entityUrl{
          path
        }
        fieldSchoolAddress
        fieldSchoolWebsite
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
        fieldIscedfBoard{
          entity {
            entityLabel
          }
        }
        fieldIscedfDetailed {
          entity {
            entityLabel
          }
        }
        fieldIscedfNarrow {
          entity {
            entityLabel
          }
        }
      }
    }
  }
}
`;

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
  iscedf_board: taxonomyTermQuery(filter: {conditions: [
    
    {operator: EQUAL, field: "vid", value: ["isced_f"], language: $lang}
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
