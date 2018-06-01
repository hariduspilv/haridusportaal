import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
// Apollo
import { ApolloModule, Apollo } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

const uri = 'http://test-htm.wiseman.ee:30000/graphql';
<<<<<<< HEAD
// const uri = 'http://test.edu.ee/graphql';
=======
// const uri = 'http://localhost:300000/graphql';
>>>>>>> ed8ff72f77241850eb9b2b9e12d1a6a699066a23

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
    // create Apollo
    apollo.create({
      link: httpLink.create({
        uri: uri,
        method: 'POST'
      }),
      cache: new InMemoryCache()
    });
  }
}
