import gql from 'graphql-tag';

export class ArticleGraph {
  
  buildSingle(path) {
    return gql`
    query {
      route(path: "${path}"){
        ... on EntityCanonicalUrl {
          languageSwitchLinks{
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
          breadcrumb{
            text
            url {
              path
              routed
            }
          }
          entity {
            ... on NodeArticle{
              title
              body {
                value
                summary
                format
              }
              fieldImage {
                derivative(style:CROP_LARGE){
                  url
                }
                targetId
                alt
                title
              }
              fieldVideo {
                input
                videoDomain
                videoDescription
                videoId
              }
            }
          }
        }
      }
    }
    `;
  }
  buildList(lang, offset=0, limit=10) {

    lang = lang.toUpperCase();
    
    return gql`
      query{
        nodeQuery(offset: ${offset}, limit: ${limit}, sort: {field:"created", direction:DESC }, filter: {conditions: [{operator: EQUAL, field: "type", value: ["article"], language: ${lang}}]}) {
          entities {
            entityTranslation(language: ET) {
              ... on NodeArticle {
                entityLabel
                created
                body{
                  summary
                }
                entityOwner {
                  entityLabel
                }
                fieldImage{
                  alt
                  derivative(style:THUMBNAIL){
                    url
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

export const getArticleData = gql`
query getArticleData($path: String!) {
  route(path: $path) {
    ... on EntityCanonicalUrl {
      languageSwitchLinks {
        active
        language {
          id
        }
        url {
          path
        }
      }
      entity {
        ... on NodeArticle {
          title
          fieldBody{
            value
          }
          fieldBodySummary
          fieldImage {
            derivative(style:CROP_LARGE){
              url
            }
            targetId
            alt
            title
          }
          fieldVideo {
            input
            videoDomain
            videoDescription
            videoId
          }
          fieldAccordionSection {
            entity {
              fieldAccordionTitle
              fieldRelatedArticle {
                url {
                  path
                }
                title
              }
              fieldBody {
                value
              }
            }
          }
          fieldRightSidebar {
            entity {
              fieldAdditional {
                entity {
                  fieldTitle
                  fieldAdditionalBody
                }
              }
              fieldContactSection {
                entity {
                  fieldPhone
                  fieldPerson
                  fieldEmail
                  fieldOrganization
                }
              }
              fieldRelatedArticle{
                url {
                  path
                }
                title
              }
              fieldHyperlinks {
                url {
                  path
                }
                title
              }
            }
          }
        }
      }
    }
  }
}
`;