import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { SideMenuService } from '@app/_services';
import { Router, RoutesRecognized, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { HttpService } from '@app/_services/httpService';
import { RootScopeService } from '@app/_services/rootScopeService';
@Component({
  selector: 'app-side-menu',
  templateUrl: './sidemenu.component.html'
})

export class SideMenuComponent implements OnInit {

  data: any;

  subscription: any;

  constructor(
    private sidemenuService: SideMenuService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpService,
    private rootScope: RootScopeService
  ) {}

  closeParentNode(e) {
    e.target.parentNode.classList.remove("menu-open");
  }

  routeIncludes(path) {
    let current = this.router.url;
    current = current.includes('?') ? current.split('?')[0] : current;
    if ((current.match(/\//g) || []).length >= 3) {
      let childSplitVar = current.split('/').pop();
      let childCurrent = current.split(`/${childSplitVar}`)[0];
      return childCurrent === path;
    }
    return (path.match(/\//g) || []).length > 1 && current === path;
  }

  getData(){

    let lang = window.location.pathname.split("/")[1];
    if( lang == "" ){ lang = "et"; }
    lang = lang.toUpperCase();
    
    let variables = {
      language: lang
    };

    let url = "/graphql?queryId=getMenu:1&variables=";
    
    let subscription = this.http.get(url+JSON.stringify(variables)).subscribe( (response) => {
      let data = response['data'];
      this.data = data['menu']['links'];
      subscription.unsubscribe();
    });
  }
  ngOnInit() {

    this.subscription = this.sidemenuService.updateLang().subscribe(status => {
      this.getData();
    });
  }

}
