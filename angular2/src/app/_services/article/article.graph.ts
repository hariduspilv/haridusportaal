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
                  url
                  targetId
                  alt
                  title
                }
              }
            }
          }
        }
      }
    `;
  }
}
