import gql from 'graphql-tag';

export const getTags = gql`
query newsletterTags($lang: LanguageId!){
  CustomTagsQuery(filter:{conditions:{field:"type", value:["news", "events"], operator:IN, language:$lang}}){
    count
    entities(language:$lang){
      entityLabel
      entityId
    }
  }
}
`;

export const signup = gql`
mutation newsletterSignup($email: String!, $tags: String!, $lang: LanguageId!){
  createTagSubscription(input:{email:$email,newtags:$tags},language:$lang){
    errors
    violations {
      path
      code
      message
    }
    entity{
      entityLabel
    }
  }
}
`;

export const activate = gql`
mutation newsletterActivate($token: String!){
  activateTagSubscription(input:{uuid:$token}){
    errors
    violations {
      message
    }
    entity {
      entityLabel
    }
  }
}
`;

export const deactivate = gql`
mutation newsletterDeactivate($token: String!){
  deactivateTagSubscription(input:{uuid:$token}){
    errors
    violations {
      message
    }
    entity {
      entityLabel
    }
  }
}
`;