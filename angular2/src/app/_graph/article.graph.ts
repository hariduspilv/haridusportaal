import gql from 'graphql-tag';

export const singleQuery = gql`
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