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
