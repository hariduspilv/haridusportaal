import { Component, OnInit, OnDestroy, AfterViewChecked, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { RootScopeService } from '@app/_services';
import { TableService } from '@app/_services/tableService';
import { HttpService } from '@app/_services/httpService';
import { UserService } from '@app/_services/userService';

@Component({
  selector: "schools-component",
  templateUrl: './schools.single.component.html',
  styleUrls: ['./schools.single.component.scss']
})
export class SchoolsSingleComponent implements OnInit, OnDestroy, AfterViewChecked {

  @Input() inputData;

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
    private route: ActivatedRoute,
    private router: Router,
    private rootScope: RootScopeService,
    private tableService: TableService,
    private http: HttpService,
    private user: UserService
  ) {}

  handleData(data) {
    this.loading = false;
    this.data = data.route.entity;
    if (data.route.entity.fieldEducationalInstitutionTy.length) {
      let types = data.route.entity.fieldEducationalInstitutionTy.map(type => type.entity.entityId)
      this.getOptions(types)
    }
  }

  ngOnInit() {

    let variables = {
      path: this.router.url
    };

    this.userLoggedOut = this.user.getData()['isExpired'];

    if( this.inputData ){
      this.handleData({
        route: { entity: this.inputData }
      });
    }else{
      this.querySubscription = this.http.get('getSchoolSingle', {params:variables}).subscribe(( response ) => {

        let data = response['data'];
        this.lang = this.rootScope.get('lang');

        if( !data['route'] ){
          this.router.navigateByUrl(`/404`, {replaceUrl: true});
        } else if (data) {
          this.handleData(data);
        }

      });
    }
    
  }

  ngOnDestroy() {
    if( this.querySubscription ){
      this.querySubscription.unsubscribe();
    }
  }

  getOptions(types) {

    let variables = {
      lang: this.lang.toUpperCase()
    };

    let subscription = this.http.get('getSchoolInstitutions', {params:variables}).subscribe( ( response ) => {
      let data = response['data'];
      this.lang = this.rootScope.get('lang');
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
