import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { HttpHeaders } from '@angular/common/http';
import gql from 'graphql-tag';

const queryObj = gql`
query {
  menu:menuByName(name: "main") {
    links {
      ... Item
      links {
        ... Item
      }
    }
  }
}

fragment Item on MenuLink {
  label
  url {
    internal:routed
    translate(language:EN){
      path
    }
    ... on EntityCanonicalUrl{
      entity{
        entityTranslation(language:EN){
          entityUrl {
            path
            internal:routed
          }
          entityLabel
        }
      }
      languageSwitchLinks {
        active
        title
      }
    }
  }
}
`;

@Component({
  selector: 'app-side-menu',
  templateUrl: './sidemenu.component.html'
})

export class SideMenuComponent {

  data: any;

  constructor(private apollo: Apollo) {

    apollo.query({
      query: queryObj,
      fetchPolicy: 'no-cache',
      context: {
        headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
      }
    }).subscribe(({data}) => {
      this.data = data['menu']['links'];
    });
  }

}
