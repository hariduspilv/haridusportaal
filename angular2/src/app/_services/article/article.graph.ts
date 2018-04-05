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

              entityTranslation(language:EN){
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
      }
    `;
  }
}
