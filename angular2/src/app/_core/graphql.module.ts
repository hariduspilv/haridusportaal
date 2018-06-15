import { NgModule } from '@angular/core';
import { HttpClientModule, HttpHeaders } from '@angular/common/http';
// Apollo
import { ApolloModule, Apollo } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import { JwtHelperService } from '@auth0/angular-jwt';

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
      
      
      let output = {};
      if (token){

        const helper = new JwtHelperService();

        const decodedToken = helper.decodeToken(token);
        const isExpired = helper.isTokenExpired(token);
        
        if( isExpired ){
          output = {};
          localStorage.removeItem('token');
        }else{
          output = {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          };
        }
        
      }

      return output;
    });

    // create Apollo
    apollo.create({
      link: auth.concat(http),
      cache: new InMemoryCache()
    });
  }
}
