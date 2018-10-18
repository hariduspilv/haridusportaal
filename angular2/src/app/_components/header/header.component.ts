import { Component, Input, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { SideMenuService, RootScopeService } from '@app/_services';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Router, Event, NavigationEnd, RoutesRecognized } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})


export class HeaderComponent {

  @Input() wasClicked: boolean;
  hideElement = true;
  param: any;
  languages: any;
  logoLink: any;
  activeLanguage: any;

  constructor(
    private sidemenu: SideMenuService,
    private apollo: Apollo,
    private rootScope: RootScopeService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService) {

    this.logoLink = '/et';

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

      let langValues = {};

      this.activeLanguage = this.rootScope.get('currentLang');

      this.logoLink = '/'+this.activeLanguage;

      for( var i in data['availableLanguages'] ){
        langValues[data['availableLanguages'][i].argument] = data['availableLanguages'][i].argument;
      }

      if( !rootScope.get('langOptions') ){
        rootScope.set('langOptions', langValues);
      }

      this.languages = data['availableLanguages'];
    });

    router.events.subscribe( (event: Event) => {
      if (event instanceof RoutesRecognized) {

        let params = event.state.root.firstChild.params;
        
        rootScope.set('currentLang', params['lang'] );
        this.activeLanguage = params['lang'];
      }
      if (event instanceof NavigationEnd) {
        var partials = ['/et', '/en', '/ru', '/'];
        this.hideElement = partials.includes(event.url) || event.url.includes('/et/otsing') || event.url.includes('/en/search');
        this.wasClicked = false;
      }
    });
  }

  title = 'app';

  changeLanguage(lang): void{


    const langOptions = this.rootScope.get('langOptions');

    let currentPath = langOptions[lang];

    if( currentPath.match("/node/") ){
      currentPath = "/"+lang;
    }

    this.activeLanguage = lang;

    this.translate.use(lang)
    this.logoLink = '/'+this.activeLanguage;
    this.changeDetectorRef.detectChanges();

    this.router.navigate([currentPath]);

  }

  toggleSideNav(): void {
    this.sidemenu.sendMessage();
  }

  searchRoute(param) {
    if (!param) {param = ''}
    let url = this.rootScope.get('currentLang') === 'et' ? `/et/otsing?term=${param}` : `/en/search?term=${param}`
    this.router.navigateByUrl(url)
  }


}
