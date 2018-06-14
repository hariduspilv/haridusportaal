import gql from 'graphql-tag';

export class EventsGraph {

  buildList(lang, offset, limit) {

    lang = lang.toUpperCase();

    return gql`
      query{
        nodeQuery(offset:${offset}, limit:${limit}, sort: {field:"field_event_date.entity.field_event_date", direction:ASC}, filter: {conditions: [{operator: EQUAL, field: "type", value: ["event"], language:${lang}}] } ) {
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
                    entityLabel
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
              EventRegistrations{
                entities{
                  ... on EventRegEntity{
                    created
                    participantEmail
                    participantPhone
                    participantLastName
                    participantFirstName
                    participantOrganization
                    participantComment
                  }
                }
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
        nodeQuery(limit: 1, sort: {field: "field_event_date.entity.field_event_date", direction: DESC}, filter: {conditions: [{operator: EQUAL, field: "type", value: ["event"], language: ${lang} }]}) {
          entities {
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
              fieldDescription {
                value
                format
                processed
              }
              registrationDate: fieldRegistrationDate {
                ...registrationdates
              }
              hashTags: fieldTag {
                entity {
                  entityLabel
                }
              }
              entityUrl {
                ...url
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

export const sortEventsByOptions = gql`
query sortByOptions (
  $tagsValue: [String],
  $tagsEnabled: Boolean,
  $typesValue: [String],
  $typesEnabled: Boolean,
  $titleValue: String,
  $titleEnabled: Boolean,
  $dateFrom: String,
  $dateTo: String,
  $lang: LanguageId!,
  $offset: Int,
  $limit: Int ) {
  nodeQuery(offset: $offset, limit: $limit, sort: {field: "field_event_date.entity.field_event_date.value", direction: ASC},
  filter: {conjunction: AND, conditions: [
    {operator: EQUAL, field: "type", value: ["event"], language: $lang},
  	{operator: IN, field: "field_tag.entity.tid", value: $tagsValue, language: $lang, enabled: $tagsEnabled },
		{operator: IN, field: "field_event_type.entity.tid", value: $typesValue, language: $lang, enabled: $typesEnabled },
    {operator: LIKE, field: "title", value: [$titleValue], language: $lang, enabled: $titleEnabled },
    {operator: GREATER_THAN_OR_EQUAL, field: "field_event_date.entity.field_event_date", value: [$dateFrom] },
    {operator: SMALLER_THAN_OR_EQUAL, field: "field_event_date.entity.field_event_date", value: [$dateTo] },
    
  ]}) {
    entities(language: $lang) {
      ... on NodeEvent {
        title:entityLabel
        location: fieldEventLocation{
          lat
          lon
          name
        }
        fieldEventType{
          entity{
            entityId
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
            entityLabel
            entityId
          }
        }
        entityUrl{
          ...url
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

// {
//   "lang": "ET",
//   "offset": 0,
//   "limit": 10,
//   "tagsValue": ["1271"],
//   "tagsEnabled": false,
//   "typesValue": ["5","6"],
//   "typesEnabled": false,
//   "titleValue": "%%",
//   "titleEnabled": false,
//   "dateFrom": "2018-01-01",
//   "dateTo": "2038-01-01"
// }

export const getEventsTags = gql`
query getEventsTags( $lang: LanguageId!){
  nodeQuery(filter: {conditions: [
    {operator: EQUAL, field: "type", value: ["event"], language: $lang}
  ]}) {
    entities(language: $lang) {
      ... on NodeEvent{
        Tag: fieldTag {
          entity {
            entityLabel
            entityId
            uuid
            name
          }
        }
      }
    }
  }
}
`;

export const getEventsTypes = gql`
query getEventsTypes( $lang: LanguageId!){
  taxonomyTermQuery(filter: {conditions: [
    {operator: EQUAL, field: "vid", value: ["event_type"], language: $lang}
  ]}) {
    entities{
      ... on TaxonomyTerm {
        name
        tid
      }
    }
  }
}
`;
