import gql from 'graphql-tag';

export const ListQuery = gql`
query(
  $lang: LanguageId!,
  $offset: Int,
  $limit: Int,
  $title: String,
  $boundsEnabled: Boolean,
  $minLat: String,
  $maxLat: String,
  $minLon: String,
  $maxLon: String,
	$location: String,
	$locationEnabled: Boolean,
	$type: [String],
	$typeEnabled:Boolean,
	$language: [String],
	$languageEnabled: Boolean,
	$ownership: [String],
	$ownershipEnabled: Boolean,
	$specialClass:String,
	$specialClassEnabled:Boolean,
	$studentHome:String,
  $studentHomeEnabled: Boolean
	) {
  nodeQuery(offset: $offset, limit: $limit, sort: {field: "title", direction: ASC},
  filter: {conjunction: AND, conditions: [
    {operator: EQUAL, field: "type", value: ["school"], language: $lang},
    {operator: LIKE, field: "title", value: [$title], language: $lang},
    {operator:IS_NOT_NULL, field:"field_school_location.entity.field_address", language:$lang},
    {operator:BETWEEN, field:"field_school_location.entity.field_coordinates.lat", value:[$minLat, $maxLat], language:$lang, enabled:$boundsEnabled},
    {operator:BETWEEN, field:"field_school_location.entity.field_coordinates.lon", value:[$minLon, $maxLon], language:$lang, enabled:$boundsEnabled},
    {operator: LIKE, field:"field_school_location.entity.field_address", value: [$location], language:$lang, enabled:$locationEnabled},
    {operator: IN, field:"field_educational_institution_ty", value: $type, language:$lang, enabled:$typeEnabled },
    {operator: IN, field:"field_teaching_language", value: $language, language:$lang, enabled:$languageEnabled },
    {operator: IN, field:"field_ownership_type", value: $ownership, language:$lang, enabled:$ownershipEnabled },
    {operator: EQUAL, field:"field_special_class", value: [$specialClass], language:$lang, enabled:$specialClassEnabled }
    {operator: EQUAL, field:"field_student_home", value: [$studentHome], language:$lang, enabled:$studentHomeEnabled }
    
    
  ]}) {
    entities(language:$lang) {
      ... on NodeSchool {
        entityLabel
        created
        fieldSchoolWebpageAddress
        fieldSchoolContactPhone
        fieldSchoolContactEmail
        fieldSpecialClass
        fieldTeachingLanguage {
          entity{
            entityLabel
          }
        }
        fieldOwnershipType {
          entity {
            entityLabel
          }
        }
        fieldEducationalInstitutionTy {
          entity{
            entityId
            entityLabel
          }
        }
        fieldSchoolLocation{
          entity{
            fieldAddress
            fieldCoordinates {
              name
              lat
              lon
            }
          }
        }
        entityUrl {
          ... on EntityCanonicalUrl {
            path
            languageSwitchLinks {
              active
              title
            }
          }
        }
      }
    }
  }
}
`;

/* For graph explorer */
const ListVariables = {
  "boundsEnabled":	false,
  "lang":	"ET",
  "limit":	5,
  "maxLat":	"59.47918422572142",
  "maxLon":	"28.033896951562497",
  "minLat":	"57.98253818017396",
  "minLon":	"21.826621560937497",
  "offset":	0,
  "title":	"%%",
  "location":"%%",
  "locationEnabled": false,
  "type": ["623"],
  "typeEnabled": false,
  "language": ["1296"],
  "languageEnabled": false,
  "ownership":["624"],
  "ownershipEnabled": false,
  "specialClass": "1",
  "specialClassEnabled": false,
  "studentHome": "1",
  "studentHomeEnabled": true 
}

export const OptionsQuery = gql`
query(
  $lang: LanguageId!
){
  taxonomyTermQuery(filter:{conditions:{field:"vid", value:["ownership_type", "teaching_language", "educational_institution_type"], language:$lang, operator:IN}}){
    entities(language:$lang){
      entityLabel
      entityId
      parentId
      ... on TaxonomyTermTeachingLanguage{
        reverseFieldTeachingLanguageNode{
          count
        }
      }
      ... on TaxonomyTermOwnershipType{
        reverseFieldOwnershipTypeNode{
          count
        }
      }
      ... on TaxonomyTermEducationalInstitutionType{
        reverseFieldEducationalInstitutionTyNode{
          count
        }
      }
    }
  }
}
`;

export const InstitutionTypeQuery = gql`
query(
  $lang: LanguageId!,
	$tids: [String]
){
  taxonomyTermQuery(filter:{
    conditions: [
      {field:"tid", value:$tids, language:$lang, operator:IN},
    	{field:"vid", value:["educational_institution_type"], language:$lang, operator:IN}
    ] 
    }
  ){
    entities(language:$lang){
      entityLabel
      entityId
      parentId
      ... on TaxonomyTermEducationalInstitutionType{
        reverseFieldEducationalInstitutionTyNode{
          count
        }
      }
    }
  }
}
`;

export const SingleQuery = gql`
  query(
    $path: String!
  ) {
    route(path: $path) {
      ... on EntityCanonicalUrl {
        entity {
          ... on NodeSchool {
            nid
            title
            fieldRegistrationCode
            fieldOwnershipType {
              entity {
                name
              }
            }
            fieldEducationalInstitutionTy {
              entity {
                name
                entityId
              }
            }
            fieldTeachingLanguage {
              entity {
                name
              }
            }
            fieldSpecialClass
            fieldStudentHome
            fieldSchoolContactPhone
            fieldSchoolContactEmail
            fieldSchoolWebpageAddress
            fieldSchoolLocation {
              entity {
                fieldAddress
                fieldLocationType
                fieldSchoolLocation {
                  entity {
                    name
                  }
                }
                fieldCoordinates {
                  lat
                  lon
                  zoom
                }
              }
            }
          }
        }
      }
    }
  }
`;
