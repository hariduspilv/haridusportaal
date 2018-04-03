import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Apollo } from 'apollo-angular';
import { HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import gql from 'graphql-tag';


@Component({
  templateUrl: './news.component.html'
})

export class NewsComponent {

  content: any;
  breadcrumb: any;
  error: boolean;

  constructor(private apollo: Apollo, private router: Router, private route: ActivatedRoute) {
    this.route.params.subscribe( params => {

      this.content = false;
      this.error = false;
      this.breadcrumb = false;

      const path = this.router.url;

      const queryObj = gql`
        query {
          route(path: "${path}"){
            ... on EntityCanonicalUrl {
              languageSwitchLinks{
                active
                title
                url {
                  path
                  routed
                  pathAlias
                  pathInternal
                }
              }
              breadcrumb{
                text
                url {
                  path
                  routed
                }
              }
              entity {

                entityTranslation(language:EN){
                 ... on NodeArticle{
                    title
                    body {
                      value
                      summary
                      format
                    }
                    fieldImage {
                      url
                      targetId
                      alt
                      title
                    }
                  }
                }
              }
            }
          }
        }
      `;

      this.apollo.query({
        query: queryObj,
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
        context: {
          headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
        }
      }).subscribe(({data}) => {
        if ( data['route'] == null ) {
          this.error = true;
        } else {
          this.content = data['route']['entity']['entityTranslation'];
          this.breadcrumb = data['route']['breadcrumb'];
        }
      });
    });
  }

}
