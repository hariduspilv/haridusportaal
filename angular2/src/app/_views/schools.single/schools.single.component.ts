import { Component, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription';

import { RootScopeService } from '@app/_services';
import { TableService } from '@app/_services/tableService';
import { HttpService } from '@app/_services/httpService';
import { UserService } from '@app/_services/userService';

@Component({
  templateUrl: './schools.single.component.html',
  styleUrls: ['./schools.single.component.scss']
})
export class SchoolsSingleComponent implements OnInit, OnDestroy, AfterViewChecked {

  loading = true;
  data: any;
  path: String;
  lang: String;
  types: any;
  tableOverflown: boolean = false;
  elemAtStart: boolean = true;
  initialized: boolean = false;
  private userLoggedOut: boolean = false;

  private querySubscription: Subscription;

  constructor(
    private apollo: Apollo,
    private route: ActivatedRoute,
    private router: Router,
    private rootScope: RootScopeService,
    private tableService: TableService,
    private http: HttpService,
    private user: UserService
  ) {}

  ngOnInit() {

    let url = "/graphql?queryId=getSchoolSingle:1&variables=";

    let variables = {
      path: this.router.url
    };

    this.userLoggedOut = this.user.getData()['isExpired'];

    this.querySubscription = this.http.get(url+JSON.stringify(variables)).subscribe(( response ) => {

      let data = response['data'];
      this.lang = this.rootScope.get('currentLang');
      this.loading = false;
      if( !data['route'] ){
        this.router.navigateByUrl(`/${this.lang}/404`, {replaceUrl: true});
      } else if (data) {
        this.data = data.route.entity;
        if (data.route.entity.fieldEducationalInstitutionTy.length) {
          let types = data.route.entity.fieldEducationalInstitutionTy.map(type => type.entity.entityId)
          this.getOptions(types)
        }
      }
    });
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }

  getOptions(types) {
    let url = "/graphql?queryId=getSchoolInstitutions:1&variables=";

    let variables = {
      lang: this.lang.toUpperCase()
    };

    let subscription = this.http.get(url+JSON.stringify(variables)).subscribe( ( response ) => {
      let data = response['data'];
      this.lang = this.rootScope.get('currentLang');
      let initialData = data['taxonomyTermQuery']['entities'];
      let children = initialData.filter(elem => elem.parentId);
      let parents = initialData.filter(elem => !children.includes(elem))
      let connections = parents.map(parent => {
        return children.filter((child) => {
          return child.parentId.toString() === parent.entityId;
        });
      });
      this.types = parents.map((elem, index) => {
        return {...elem, children: [...connections[index]]};
      })
      subscription.unsubscribe();
    });
  }

  ngAfterViewChecked() {
    this.initialTableCheck('tableRef')
  }

  initialTableCheck(id) {
    const element = document.getElementById(id);
    if (element) {
      this.tableOverflown = (element.scrollWidth - element.scrollLeft) > element.clientWidth;
      this.initialized = true;
    }
  }

}
