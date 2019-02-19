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
  public isMobile: boolean = false;
  public version: any = false;
  subscription: any;

  debounce: any;

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
    if ((current.match(/\//g) || []).length >= 2) {
      let childSplitVar = current.split('/').pop();
      let childCurrent = current.split("/" + childSplitVar)[0];
      return childCurrent === path;
    }
    return (path.match(/\//g) || []).length > 1 && current === path;
  }

  getData(){
    clearTimeout( this.debounce );
    this.debounce = setTimeout( () => {
      let lang = this.rootScope.get("lang");
      
      let variables = {
        language: lang.toUpperCase()
      };

      
      let subscription = this.http.get('getMenu', { params: variables} ).subscribe( (response) => {
        let data = response['data'];
        this.data = data['menu']['links'];
        subscription.unsubscribe();
      });
    }, 300);
    
  }
  ngOnInit() {
    this.isMobile = window.innerWidth <= 1024;
    this.subscription = this.sidemenuService.updateLang().subscribe(status => {
      this.getData();
    });
    this.getData();
    this.appVersion();
  }

  appVersion() {
    return this.http.get('./assets/version.json').subscribe(data => {
      this.version = data;
    });
  }
}
