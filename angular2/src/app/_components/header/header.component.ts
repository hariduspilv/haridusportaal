import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { SideMenuService } from '../../_services';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})

export class HeaderComponent {

  languages: any;

  constructor(private sidemenu: SideMenuService, private apollo: Apollo) {

    const queryObj = gql`
      query site_langs{
         availableLanguages{
          name
            argument
            isDefault
        }
      }
    `;

    this.apollo.query({
      query: queryObj
    }).subscribe(({data}) => {
      this.languages = data['availableLanguages'];
    });
  }

  title = 'app';

  toggleSideNav(): void {
    this.sidemenu.sendMessage();
  }

}
