import gql from 'graphql-tag';

export class NewsGraph {

  buildList(lang, offset, limit) {

    lang = lang.toUpperCase();

    return gql`
      query{
         nodeQuery(offset: ${offset}, limit: ${limit}, sort: {field:"created", direction:DESC }, filter: {conditions: [{operator: EQUAL, field: "type", value: ["news"], language: ${lang}}]}) {
            entities {
               ... on NodeNews {
               entityLabel
               created
                     entityUrl {
                        ... on EntityCanonicalUrl{
                     path
                     
                     languageSwitchLinks {
                     active
                     title
                     }
                  }
                     }
               fieldNewsDescription {
                  value
                  summary
               }
               entityOwner {
                  entityLabel
               }
               fieldIntroductionImage {
                  url
                  alt
               }
               
               fieldNewsTag {
                  entity{
                     entityLabel
                  }
               }
               
               }
            }
         }
       }
       
    `;
  }
}
