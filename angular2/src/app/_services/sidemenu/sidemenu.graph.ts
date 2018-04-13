import gql from 'graphql-tag';

export class SidemenuGraph {

  buildQuery(lang) {
    return gql`
      query {
        menu:menuByName(name: "main") {
          links {
            ... Item
            links {
              ... Item
              links {
                ... Item
              }
            }
          }
        }
      }

      fragment Item on MenuLink {
        label
        url {
          internal:routed
          translate(language:${lang}){
            path
          }
          ... on EntityCanonicalUrl{
            entity{
              entityTranslation(language:${lang}){
                entityUrl {
                  path
                  internal:routed
                }
                entityLabel
              }
            }
            languageSwitchLinks {
              active
              title
            }
          }
        }
      }
    `;
  }
}
