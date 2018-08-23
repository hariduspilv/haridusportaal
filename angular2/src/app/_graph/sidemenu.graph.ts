import gql from 'graphql-tag';

export class SidemenuGraph {

  buildQuery(lang) {

    let langUppercase = lang.toUpperCase();

    return gql`
        query {
          menu:menuByName(name:"main", language:${lang}){
            links{
              ... Item
              links{
                ... Item
                links{
                  ... Item
                }
              }
            }
          }
        }
        
        fragment Item on MenuLink{
          description
          label
          url{
            path
            internal:routed
            ... on EntityCanonicalUrl{
              entity{
                entityAccess(operation:"view content")
              }
            }
          }
        }
    `;
  }
}
