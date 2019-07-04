import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { SideMenuService } from '@app/_services';
import { Router, RoutesRecognized, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { HttpService } from '@app/_services/httpService';
import { RootScopeService } from '@app/_services/rootScopeService';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-side-menu',
  templateUrl: './sidemenu.component.html'
})

export class SideMenuComponent implements OnInit {

  data: any;
  public isMobile: boolean = false;
  public version: any = environment.VERSION;
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
    if ((current.match(/\//g) || []).length === 2) {
      let childSplitVar = current.split('/').pop();
      let childCurrent = current.split("/" + childSplitVar)[0];
      return decodeURIComponent(childCurrent) === path;
    } else if ((current.match(/\//g) || []).length >= 3) {
      let childSplitVar = current.split('/').pop()
      let childCurrent = current.split("/" + childSplitVar)[0];
      let secondChildSplitVar = childCurrent.split('/').pop();
      let childFinal = childCurrent.split('/' + secondChildSplitVar)[0];
      return decodeURIComponent(childFinal) === path;
    }
    return decodeURIComponent(current) === path;
  }

  getData(){
    let lang = this.rootScope.get("lang");
    
    let variables = {
      language: lang.toUpperCase()
    };

    
    let subscription = this.http.get('getMenu', { params: variables} ).subscribe( (response) => {
      let data = response['data'];
      this.data = data['menu']['links'];
      subscription.unsubscribe();
    });
    
  }
  ngOnInit() {
    this.isMobile = window.innerWidth <= 1024;
    this.subscription = this.sidemenuService.updateLang().subscribe(status => {
      this.getData();
    });
    this.getData();
    //this.appVersion();
  }

  appVersion() {
    return this.http.get('./assets/version.json').subscribe(data => {
      this.version = data;
    });
  }
}
