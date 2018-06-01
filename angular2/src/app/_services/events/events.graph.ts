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
  $tagValue: [String],
  $tagEnabled: Boolean,
  $tidValue: [String],
  $tidEnabled: Boolean,
  $titleValue: String,
  $titleEnabled: Boolean,
  $minDate: String,
  $maxDate: String,
  $lang: LanguageId!,
  $offset: Int,
  $limit: Int ) {
  nodeQuery(offset: $offset, limit: $limit, sort: {field: "field_event_date.entity.field_event_date.value", direction: ASC},
  filter: {conjunction: AND, conditions: [
    {operator: EQUAL, field: "type", value: ["event"], language: $lang},
  	{operator: IN, field: "field_tag.entity.tid", value: $tagValue, language: $lang, enabled: $tagEnabled },
		{operator: IN, field: "field_event_type.entity.tid", value: $tidValue, language: $lang, enabled: $tidEnabled },
    {operator: LIKE, field: "title", value: [$titleValue], language: $lang, enabled: $titleEnabled },
    {operator: GREATER_THAN_OR_EQUAL, field: "field_event_date.entity.field_event_date", value: [$minDate] },
    {operator: SMALLER_THAN_OR_EQUAL, field: "field_event_date.entity.field_event_date", value: [$maxDate] },
    
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
//   "tagValue": ["1271"],
//   "tagEnabled": false,
//   "tidValue": ["5","6"],
//   "tidEnabled": true,
//   "titleValue": "%%",
//   "titleEnabled": false,
//   "minDate": "-2147483647",
//   "maxDate": "2147483647"
// }