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
  $maxLon: String) {
  nodeQuery(offset: $offset, limit: $limit, sort: {field: "title", direction: ASC},
  filter: {conjunction: AND, conditions: [
    {operator: EQUAL, field: "type", value: ["school"], language: $lang},
    {operator: LIKE, field: "title", value: [$title], language: $lang},
    {operator:IS_NOT_NULL, field:"field_school_location.entity.field_address", language:$lang},
    {operator:BETWEEN, field:"field_school_location.entity.field_coordinates.lat", value:[$minLat, $maxLat], language:$lang, enabled:$boundsEnabled},
    {operator:BETWEEN, field:"field_school_location.entity.field_coordinates.lon", value:[$minLon, $maxLon], language:$lang, enabled:$boundsEnabled}
    
  ]}) {
    entities(language:$lang) {
      ... on NodeSchool {
        entityLabel
        created
        fieldSchoolWebpageAddress
        fieldSchoolContactPhone
        fieldSchoolContactEmail
        fieldEducationalInstitutionTy {
          entity{
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
              zoom
              type
              width
              height
              infowindow
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
