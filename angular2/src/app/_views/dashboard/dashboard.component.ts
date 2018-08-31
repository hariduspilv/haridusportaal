import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '@app/_services/userService';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { RootScopeService } from '@app/_services/rootScopeService';

@Component({
  templateUrl: "dashboard.component.html",
  styleUrls: ["dashboard.component.scss"]
})

export class DashboardComponent implements OnInit, OnDestroy{
  public lang: string;
  public path: string;
  
 
  subscriptions: Subscription[] = [];
  
  public mainMenu = {
    "et": [ {_id: 1, link: '/et/toolaud/taotlused'},
          {_id: 2, link: '/et/toolaud/tunnistused'},
          {_id: 3, link: '/et/toolaud/opingud'},
          {_id: 4, link: '/et/toolaud/opetan'}],

    "en": [ {_id: 1, link: '/en/dashboard/applications'},
          {_id: 2, link: '/en/dashboard/certificates'},
          {_id: 3, link: '/en/dashboard/studies'},
          {_id: 4, link: '/en/dashboard/teachings'}]
  };

  public mainMenuCommonAttrs = {
    1: {icon: 'description', label: 'frontpage.dashboard_tabs_applications'},
    2: {icon: 'class', label: 'frontpage.dashboard_tabs_certificates'},
    3: {icon: 'local_library', label: 'frontpage.dashboard_tabs_studies'},
    4: {icon: 'school', label: 'frontpage.dashboard_tabs_teachings'}
  }
  public userData;

  constructor(
    private rootScope: RootScopeService,
    private router: Router,
    private route: ActivatedRoute,
    private user: UserService
  ){

  }
  pathWatcher() { 
    
    let parameters = this.route.params.subscribe(
      (params: ActivatedRoute) => {
          //console.log('ROUTE PARAM CHANGED');
          this.lang = params['lang'];
          this.path = this.router.url;
          this.setPaths();       
      }
    );

    let endpoint = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        //console.log('ROUTE CHANGED');
        this.path = this.router.url;
        this.setPaths();
      }
    });
   
    this.subscriptions = [...this.subscriptions, parameters, endpoint];
   
  }
  setPaths() {
    let selectedLink = this.mainMenu[this.lang].find(item => item.link == this.path)
    let unselectedLangs: string[] = Object.keys(this.mainMenu).filter(language => language != this.lang);
    
    let opts = {};
    
    opts[this.lang] = this.path;

    unselectedLangs.forEach(language => {
      opts[language] = this.mainMenu[language].find(counterpartLink => counterpartLink._id == selectedLink._id).link
    })
    //console.log(opts);
    this.rootScope.set('langOptions', opts);
  }
  ngOnInit(){
    
    this.userData = this.user.getData();
    this.pathWatcher();
    if(this.userData.isExpired === true){
      this.router.navigateByUrl('');
    }
    
  }
  ngOnDestroy(){
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
}