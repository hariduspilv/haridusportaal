import gql from 'graphql-tag';

export class EventsGraph {

  buildList() {
    return gql`
      query{
        nodeQuery(filter: {conditions: [{operator: EQUAL, field: "type", value: ["event"]}, {operator: EQUAL, field: "langcode", value: ["en"]}]}) {
          entities {
            ... on NodeEvent {
              title: entityLabel
              location: fieldEventLocation {
                ...location
              }
              eventType: fieldEventType {
                entity {
                  entityLabel
                }
              }
              eventDate: fieldEventDate {
                ...eventdates
              }
              registrationDate: fieldRegistrationDate {
                ...registrationdates
              }
              hashTags: fieldTags {
                entity {
                  entityLabel
                }
              }
              entityUrl {
                ... url
              }
            }
          }
        }
      }

      fragment location on FieldNodeFieldEventLocation {
        name
        lat
        lon
      }

      fragment eventdates on FieldNodeFieldEventDate {
        entity {
          fieldEventDate {
            value
            date
          }
          fieldEventStartTime
          fieldEventEndTime
        }
      }

      fragment registrationdates on FieldNodeFieldRegistrationDate {
        entity {
          fieldRegistrationFirstDate {
            value
            date
          }
          fieldRegistrationFirstDate {
            value
            date
          }
        }
      }

      fragment url on EntityCanonicalUrl{
        path
        languageSwitchLinks {
          active
          title
        }
      }
    `;
  }
}
