import gql from 'graphql-tag';

export class EventsGraph {

  buildList(lang, offset, limit) {

    lang = lang.toUpperCase();

    return gql`
      query{
        nodeQuery(offset:${offset}, limit:${limit}, sort: {field:"field_event_date.entity.field_event_date", direction:ASC}, filter: {conditions: [{operator: EQUAL, field: "type", value: ["event"], language:${lang}}]}) {
          entities{
            entityTranslation(language:${lang}){
              ... on NodeEvent{
                title:entityLabel
                location: fieldEventLocation{
                  lat
                  lon
                  name
                }
                fieldEventType{
                  entity{
                    entityLabel
                  }
                }
                eventDates: fieldEventDate{
                  ...eventdates
                }
                fieldEntryType
                registrationDate:fieldRegistrationDate{
                  ...registrationdates
                }
                
                hashTags:fieldTag{
                  entity{
                    entityTranslation(language:${lang}){
                      entityLabel 
                    }
                  }
                }
                entityUrl{
                  ...url
                }
              }
            }
          }
        }
      }
      
      fragment eventdates on FieldNodeFieldEventDate {
        entity {
          fieldEventDate {
            value
            date
            unix
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
            unix
          }
          fieldRegistrationLastDate{
            value
            date
            unix
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

  buildSingle(lang, path){

    lang = lang.toUpperCase();

    return gql`
    query{
      route(path: "${path}") {
        ... on EntityCanonicalUrl {
          languageSwitchLinks {
            active
            title
            language {
              id
            }
            url {
              path
              routed
              pathAlias
              pathInternal
            }
          }
          entity {
            ... on NodeEvent {
              entityLabel
              nid
              fieldPicture {
                url
                width
                height
                alt
                title
              }
              fieldAttachmentFile {
                entity {
                  entityLabel
                  entityType
                  entityChanged
                  entityBundle
                  entityCreated
                  url
                  filename
                  filemime
                }
              }
              fieldEventLocation{
                name
                lat
                lon
                zoom
              }
              fieldEventDate {
                entity {
                  fieldEventDate {
                    value
                    date
                    unix
                  }
                  fieldEventStartTime
                  fieldEventEndTime
                }
              }
              fieldEntryType
              fieldRegistrationDate{
                entity {
                  fieldRegistrationFirstDate {
                    value
                    date
                    unix
                  }
                  fieldRegistrationLastDate{
                    value
                    date
                    unix
                  }
                }
              }
              fieldEventLink {
                url {
                  routed
                  path
                }
                title
              }
              fieldDescription {
                value
              }
              fieldDescriptionSummary
              fieldContactPerson
              fieldContactPhone
              fieldContactEmail
							fieldPracticalInformation {
							  value
							  format
							  processed
              }
              fieldEventGroup {
                targetId
              }
              fieldTag {
                entity {
                  entityTranslation(language: ${lang}) {
                    entityLabel
                  }
                }
              }
              fieldEventType {
                entity {
                  entityLabel
                }
              }
            }
          }
        }
      }
    }`;
  }

  buildRelated(lang, nid, groupID){

    lang = lang.toUpperCase();

    return gql`
      query{
        nodeQuery(limit: 3, sort: {field: "field_event_date.entity.field_event_date", direction: ASC}, filter: {conditions: [
          {operator: EQUAL, field: "field_event_group.target_id", value: ["${groupID}"], language: ${lang} }
          {operator: NOT_EQUAL, field: "nid", value: ["${nid}"], language: ${lang} }
        ]}) {
          entities {
            entityTranslation(language: ${lang}) {
              ... on NodeEvent {
                title: entityLabel
                nid
                location: fieldEventLocation {
                  lat
                  lon
                  name
                }
                fieldEventType {
                  entity {
                    entityLabel
                  }
                }
                eventDates: fieldEventDate {
                  ...eventdates
                }
                fieldEntryType
                registrationDate: fieldRegistrationDate {
                  ...registrationdates
                }
                hashTags: fieldTag {
                  entity {
                    entityTranslation(language: ${lang}) {
                      entityLabel
                    }
                  }
                }
                entityUrl {
                  ...url
                }
              }
            }
          }
        }
      }
      
      fragment eventdates on FieldNodeFieldEventDate {
        entity {
          fieldEventDate {
            value
            date
            unix
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
            unix
          }
          fieldRegistrationLastDate {
            value
            date
            unix
          }
        }
      }
      
      fragment url on EntityCanonicalUrl {
        path
        languageSwitchLinks {
          active
          title
        }
      }
      
    `;

  }

  buildRecent(lang){

    lang = lang.toUpperCase();

    return gql`
      query{
        nodeQuery(limit: 2, sort: {field: "field_event_date.entity.field_event_date", direction: DESC}, filter: {conditions: [{operator: EQUAL, field: "type", value: ["event"], language: ${lang} }]}) {
          entities {
            entityTranslation(language: ${lang}) {
              ... on NodeEvent {
                title: entityLabel
                location: fieldEventLocation {
                  lat
                  lon
                  name
                }
                fieldEventType {
                  entity {
                    entityLabel
                  }
                }
                eventDates: fieldEventDate {
                  ...eventdates
                }
                fieldEntryType
                fieldDescription{
                  summary
                }
                registrationDate: fieldRegistrationDate {
                  ...registrationdates
                }
                hashTags: fieldTag {
                  entity {
                    entityTranslation(language: ${lang}) {
                      entityLabel
                    }
                  }
                }
                entityUrl {
                  ...url
                }
              }
            }
          }
        }
      }
      
      fragment eventdates on FieldNodeFieldEventDate {
        entity {
          fieldEventDate {
            value
            date
            unix
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
            unix
          }
          fieldRegistrationLastDate {
            value
            date
            unix
          }
        }
      }
      
      fragment url on EntityCanonicalUrl {
        path
        languageSwitchLinks {
          active
          title
        }
      }      
    `;

  }
}
