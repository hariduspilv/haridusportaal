import { NgModule } from '@angular/core';
import { HttpClientModule, HttpHeaders } from '@angular/common/http';
// Apollo
import { ApolloModule, Apollo } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';

const uri = 'http://test-htm.wiseman.ee:30000/graphql';
// const uri = 'http://localhost:300000/graphql';

@NgModule({
  exports: [
    HttpClientModule,
    ApolloModule,
    HttpLinkModule
  ]
})
export class GraphQLModule {
  constructor(
    apollo: Apollo,
    httpLink: HttpLink
  ) {

    const http = httpLink.create({uri: 'http://test-htm.wiseman.ee:30000/graphql'});

    const auth = setContext((request, previousContext) => {
      // get the authentication token from local storage if it exists
      const token = localStorage.getItem('token');
      // return the headers to the context so httpLink can read them
      // in this example we assume headers property exists
      // and it is an instance of HttpHeaders
      if (!token) {
        return {
          
        };
      } else {
        return {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
      }
    });

    // create Apollo
    apollo.create({
      link: auth.concat(http),
      cache: new InMemoryCache()
    });
  }
}
