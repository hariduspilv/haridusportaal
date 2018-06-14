import gql from 'graphql-tag';

export const getBreadcrumb = gql`
query getBreadcrumbs($path: String!) {
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
      entity{
        entityMetatags{
          name:key
          content:value
        }
      }
      breadcrumb {
        text
        url {
          path
          routed
        }
      }
    }
  }
}
`;