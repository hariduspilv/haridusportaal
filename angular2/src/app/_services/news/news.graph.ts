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
}
