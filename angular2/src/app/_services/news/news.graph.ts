import gql from 'graphql-tag';

export class NewsGraph {
  
  buildList(lang, offset, limit) {
    
    lang = lang.toUpperCase();
    
    return gql`
    query{
      nodeQuery(offset: ${offset}, limit: ${limit}, sort: {field: "created", direction: DESC}, filter: {conditions: [{operator: EQUAL, field: "type", value: ["news"], language: ${lang}}]}) {
        entities {
          entityTranslation(language: ${lang}) {
            ... on NodeNews {
              entityLabel
              created
              entityUrl {
                ... on EntityCanonicalUrl {
                  path
                  languageSwitchLinks {
                    active
                    title
                  }
                }
              }
              fieldShortDescription
              fieldAuthor
              fieldIntroductionImage {
                url
                alt
              }
              fieldNewsTag {
                entity {
                  entityLabel
                }
              }
            }
          }
        }
      }
    }
    `;
  }
  
  buildSingle(lang, path) {
    
    lang = lang.toUpperCase();
    return gql`
    query{
      route(path:"${path}"){
        ... on EntityCanonicalUrl{
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
          entity{
            ... on NodeNews {
              entityLabel
              nid
              created
              fieldAuthor
              fieldNewsDescription {
                value
              }
              fieldShortDescription
              fieldIntroductionImage {
                url
                alt
              }
              fieldAdditionalImages{
                derivative(style:CUSTOM_CROP_STYLE_16_9_){
                  url 
                }
                alt
              }
              fieldNewsLink {
                url {
                  path
                }
                title
              }
              fieldNewsTag{
                entity{
                  entityLabel
                  tid
                }
              }
              entityUrl {
                ... on EntityCanonicalUrl {
                  languageSwitchLinks {
                    url {
                      routed
                      path
                      pathAlias
                      pathInternal
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    `;
  }
  
  buildRecent(nid, lang) {
    
    lang = lang.toUpperCase();
    
    return gql`
    query {
      nodeQuery(limit: 1, sort: {field: "created", direction: DESC}, filter: {conditions: [{operator: EQUAL, field: "type", value: ["news"], language: ${lang}}]}) {
        entities {
          ... on NodeNews {
            entityLabel
            created
            fieldShortDescription
            entityUrl {
              ... on EntityCanonicalUrl {
                path
                languageSwitchLinks {
                  url {
                    path
                  }
                }
              }
            }
          }
        }
      }
    }
    
    `;
  }
}
export const getNewsTags = gql`
query getNewsTags($lang: LanguageId!){
  taxonomyTermQuery(limit: 1000, filter: {conditions: [{operator: EQUAL, field: "vid", value: ["tags"], language: $lang}]}) {
    entities {
      entityId
      entityLabel
    }
  }
}

`;


export const getNewsTags2 = gql`
query getNewsTags2( $lang: LanguageId!){
  nodeQuery(filter: {conditions: [
    {operator: EQUAL, field: "type", value: ["news"], language: $lang}
  ]}) {
    entities(language: $lang) {
      ... on NodeNews{
        Tag: fieldNewsTag {
          entity{
            entityId
            entityLabel
          }
        }
      }
    }
  }
}
`;


// query{
//   nodeQuery(
//     offset: 0, 
//     limit: 10, 
//     sort: {field: "created", direction: DESC}, 
//     filter: {
//       conditions: [{operator: EQUAL, field: "type", value: ["news"], language: ET}]}) {
//     entities {
//       entityTranslation(language: ET) {
//         ... on NodeNews {
//           entityLabel
//           created
//           entityUrl {
//             ... on EntityCanonicalUrl {
//               path
//               languageSwitchLinks {
//                 active
//                 title
//               }
//             }
//           }
//           fieldShortDescription
//           fieldAuthor
//           fieldIntroductionImage {
//             url
//             alt
//           }
//           fieldNewsTag {
//             entity {
//               entityLabel
//             }
//           }
//         }
//       }
//     }
//   }
// }


export const sortByOptions = gql`
query sortByOptions (
  $tagValue: [String],
  $tagEnabled: Boolean,
  $titleValue: String,
  $titleEnabled: Boolean,
  $minDate: String,
  $maxDate: String,
  $lang: LanguageId!,
  $offset: Int,
  $limit: Int ) {
  nodeQuery(offset: $offset, limit: $limit, sort: {field: "created", direction: DESC},
  filter: {conjunction: AND, conditions: [
    {operator: EQUAL, field: "type", value: ["news"], language: $lang},
    {operator: IN, field: "field_news_tag.entity.tid", value: $tagValue, language: $lang, enabled: $tagEnabled },
    {operator: LIKE, field: "title", value: [$titleValue], language: $lang, enabled: $titleEnabled },
    {operator: GREATER_THAN_OR_EQUAL, field: "created", value: [$minDate], language: $lang },
    {operator: SMALLER_THAN_OR_EQUAL, field: "created", value: [$maxDate], language: $lang },
    
  ]}) {
    entities {
      ... on NodeNews {
        entityLabel
        created
        entityUrl {
          ... on EntityCanonicalUrl {
            path
            languageSwitchLinks {
              active
              title
            }
          }
        }
        fieldShortDescription
        fieldAuthor
        fieldIntroductionImage {
          url
          alt
        }
        fieldNewsTag {
          entity {
            entityLabel
            tid
          }
        }
      }
    }
  }
}
`;

// {
//   "lang": "ET",
//   "offset": 0,
//   "limit": 10,
//   "tagValue": "21",
//   "tagEnabled": false,
//   "titleValue": "%n%",
//   "titleEnabled": false,
//   "minDate": "-2147483647",
//   "maxDate": "2147483647"
// }