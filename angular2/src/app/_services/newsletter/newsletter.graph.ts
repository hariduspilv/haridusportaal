import gql from 'graphql-tag';

export const getTags = gql`
query newsletterTags($lang: LanguageId!){
  taxonomyTermQuery(filter:{conditions:{field: "vid", value: ["tags", "event_tags"], operator: IN, language:$lang}}){
    entities(language:$lang){
      entityLabel
      entityId
      ... on TaxonomyTermTags{
        reverseFieldTagNode{
          count
        }
      }
      ... on TaxonomyTermEventTags{
        reverseFieldTagNode{
          count
        }
      }
    }
  }
}
`;