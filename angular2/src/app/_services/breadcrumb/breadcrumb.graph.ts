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