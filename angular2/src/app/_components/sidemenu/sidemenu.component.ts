import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { HttpHeaders } from '@angular/common/http';
import { SideMenuService } from '../../_services';
import gql from 'graphql-tag';

@Component({
  selector: 'app-side-menu',
  templateUrl: './sidemenu.component.html'
})

export class SideMenuComponent {

  data: any;

  constructor(private apollo: Apollo, private sidemenuService: SideMenuService) {

    sidemenuService.getData( data => {

      this.data = data['menu']['links'];

    });

  }

}
