import gql from 'graphql-tag';

export const recentQuery = gql`
query(
  $lang: LanguageId!
){
  nodeQuery(limit: 3, sort: {field: "field_event_date.entity.field_event_date", direction: DESC}, filter: {conditions: [{operator: EQUAL, field: "type", value: ["event"], language: $lang }]}) {
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

export const relatedQuery = gql`
query(
  $groupID: String,
  $lang: LanguageId!,
  $nid: String
){
  nodeQuery(limit: 3, sort: {field: "field_event_date.entity.field_event_date", direction: ASC}, filter: {conditions: [
    {operator: EQUAL, field: "field_event_group.target_id", value: [$groupID], language: $lang }
    {operator: NOT_EQUAL, field: "nid", value: [$nid], language: $lang }
  ]}) {
    entities(language: $lang) {
      ... on NodeEvent {
        title: entityLabel
        created
        nid
        location: fieldEventLocation {
          lat
          lon
          name
        }
        fieldEventLocationLink{
          uri
          title
        }
        fieldEventType {
          entity {
            entityLabel
          }
        }
        fieldContactPerson
        eventDates: fieldEventDate {
          ...eventdates
        }
        fieldEntryType
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
`

export const singleQuery = gql`
query(
  $path: String!
){
  route(path: $path) {
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
          RegistrationCount
          fieldMaxNumberOfParticipants
          fieldPicture {
            derivative(style:CROP_LARGE){
              url
            }
            width
            height
            alt
            title
          }
          fieldEventMainDate{
            value
            date
            unix
          }
          fieldEventMainStartTime
          fieldEventMainEndTime
          EventRegistrations{
            entities{
              ... on EventRegEntity{
                participantCreated:created
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
            description
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
          fieldEventLocationLink{
            title
            uri
          }
          fieldOrganizer
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
              entityLabel
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
  $timeFrom: String,
  $timeTo: String,
  $lang: LanguageId!,
  $offset: Int,
  $limit: Int ) {
  nodeQuery(offset: $offset, limit: $limit, sort: {field: "field_event_main_date", direction: ASC},
  filter: {conjunction: AND, conditions: [
    {operator: EQUAL, field: "type", value: ["event"], language: $lang},
  	{operator: IN, field: "field_tag.entity.tid", value: $tagsValue, language: $lang, enabled: $tagsEnabled },
		{operator: IN, field: "field_event_type.entity.tid", value: $typesValue, language: $lang, enabled: $typesEnabled },
    {operator: LIKE, field: "title", value: [$titleValue], language: $lang, enabled: $titleEnabled },
    {operator: GREATER_THAN_OR_EQUAL, field: "field_event_main_date", value: [$dateFrom] },
    {operator: SMALLER_THAN_OR_EQUAL, field: "field_event_main_date", value: [$dateTo] },
    {operator: GREATER_THAN_OR_EQUAL, field: "field_event_main_start_time", value: [$timeFrom] },
    {operator: SMALLER_THAN_OR_EQUAL, field: "field_event_main_start_time", value: [$timeTo] },
    
  ]}) {
    entities(language: $lang) {
      ... on NodeEvent {
        nid
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
        fieldEventMainDate{
          value
          date
          unix
        }
        fieldEventMainStartTime
        fieldEventMainEndTime
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
    ... on ParagraphEventDate {
      fieldEventDate {
        value
        date
        unix
      }
      fieldEventStartTime
      fieldEventEndTime
    }
  }
}

fragment registrationdates on FieldNodeFieldRegistrationDate {
  entity {
    ... on ParagraphRegistrationPeriod{
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
}

fragment url on EntityCanonicalUrl{
  path
  languageSwitchLinks {
    active
    title
  }
}
`;

const listVariables = {
  "lang": "ET",
  "offset": 0,
  "limit": 10,
  "tagsValue": ["1271"],
  "tagsEnabled": false,
  "typesValue": ["5","6"],
  "typesEnabled": false,
  "titleValue": "%%",
  "titleEnabled": false,
  "dateFrom": "2018-01-01",
  "dateTo": "2038-01-01",
  "timeFrom": "0",
  "timeTo": "9999999"
}

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

export const eventsRegister = gql`
mutation(
  $event_id: Int!,
  $firstName: String!,
  $lastName: String!,
  $companyName: String,
  $telephone: String,
  $email: String!,
  $marked: String,
  $lang: LanguageId!,
){
  createEventRegistration(input
  :{event_id:$event_id, first_name:$firstName, last_name: $lastName, email:$email, phone:$telephone, comment: $marked, organization: $companyName}, language:$lang){
    entity {
      entityLabel
      entityType
      entityUuid
      entityBundle
      entityChanged
      entityId
      entityCreated
      
    }
    errors
    violations {
      message
      path
      code
    }
    
  }
}
`;
