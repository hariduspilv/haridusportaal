import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from '../../../../node_modules/rxjs';
import { RootScopeService } from '@app/_services/rootScopeService';
import { UserService } from '@app/_services/userService';

@Component({
  selector: 'teachings-detailed',
  templateUrl: './teachings.detailed.template.html',
  styleUrls: ['../certificates/certificates.styles.scss']
})
export class TeachingsDetailedComponent implements OnInit{
  public lang: string;
  public path: string;
  public type: string;
  public dashboardLink: string;
  public userData;
  public content: any = false;
  public breadcrumbs: any = false;
  public viewChecked: boolean = false;
  public loading: boolean;
  subscribe: Subscription;
  initialCrumbs = {
    'en': [{"text": "Home", "url": "/en"}, {"text": "Teaching", "url": "/en/dashboard/teachings"}],
    'et': [{"text": "Avaleht", "url": "/et"}, {"text": "Õpetan", "url": "/et/toolaud/opetan"}]
  };

  constructor(
    private user: UserService,
    private rootScope: RootScopeService,
    private route: ActivatedRoute,
    private router: Router,) {}

  setPaths() {
    this.rootScope.set('langOptions', {
      'en': '/en/dashboard/teachings/'+ this.type,
      'et': '/et/toolaud/opetan/'+ this.type
    });
  }

  pathWatcher() { 
    this.subscribe = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.path = this.router.url;
        this.lang = params['lang'];
        this.type = params['type'];
        this.dashboardLink = this.path.split(`/${this.type}`)[0];
      }
    );
    this.setPaths();
  }

  ngOnInit() {
    this.loading = true;
    this.pathWatcher();
    this.content = this.rootScope.get('teachingsDetail');
    this.userData = this.user.getData();
    if(this.userData.isExpired === true){
      this.router.navigateByUrl('');
    } else if (!this.content) {
      this.router.navigateByUrl(this.dashboardLink);
    }
    this.breadcrumbs = this.constructCrumbs();
    this.loading = false;
  }

  ngAfterViewChecked() {
    if (this.content && !this.loading && this.dashboardLink && !this.viewChecked) {
      document.getElementById('backToDashboard').focus();
      this.viewChecked = true;
    }
  }

  ngOnDestroy() {
    this.subscribe.unsubscribe();
  }

  parseTypeTranslation(type) {
    return `frontpage.${type}`;
  }

  constructCrumbs() {
    let crumbs = this.initialCrumbs[this.lang];
    var crumbText = this.content.oppeasutus;
    return [...crumbs, {text: crumbText, url: ''}];
  }

}