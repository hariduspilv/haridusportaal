import { Component, Input, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { SideMenuService, RootScopeService } from '@app/_services';
import { Router, Event, NavigationEnd, RoutesRecognized } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { HttpService } from '@app/_services/httpService';
import { SettingsService } from '@app/_core/settings';

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
  public suggestionSubscription: Subscription;
  public suggestionList: any = false;
  public debouncer: any;
  public autocompleteLoader: boolean = false;
  

  constructor(
    private sidemenu: SideMenuService,
    private rootScope: RootScopeService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
    private http: HttpService,
    private settings: SettingsService
  ) {

    this.logoLink = "/";

    /*
    let url = "/graphql?queryName=siteLangs&queryId=938d5cb55fe96f1c0a6a69a0bbb983d939644f01:1";
    
    let subscribe = this.http.get(url).subscribe( (response) => {
      let data = response['data'];

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
    */

    router.events.subscribe( (event: Event) => {
      if (event instanceof RoutesRecognized) {

        let params = event.state.root.firstChild.params;
        this.activeLanguage = this.rootScope.get("lang");
      }
      if (event instanceof NavigationEnd) {
        var partials = ['/et', '/en', '/ru', '/'];
        this.hideElement = partials.includes(event.url) || event.url.includes('/otsing');
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
    let url = `/otsing?term=${param}`;
    this.param = '';
    this.router.navigateByUrl(url)
  }

  populateSuggestionList(searchText, debounceTime) {
    if(searchText.length < 3) {
      clearTimeout(this.debouncer);
      this.suggestionList = [];
      return;
    }
    if(this.debouncer) clearTimeout(this.debouncer)
    if(this.suggestionSubscription !== undefined) {
      this.suggestionSubscription.unsubscribe();
    }
    this.debouncer = setTimeout(_ => {
      this.autocompleteLoader = true;
      let url = this.settings.url+"/graphql?queryId=27813a87b01c759d984808a9e9ea0333627ad584:1&variables=";
      let variables = {
        search_term: searchText
      }
      let suggestionSubscription = this.http.get(url+JSON.stringify(variables)).subscribe(res => {
        this.autocompleteLoader = false;
        this.suggestionList = res['data']['CustomElasticAutocompleteQuery'] || [];
        this.suggestionSubscription.unsubscribe();
      });

    }, debounceTime)
  }


}
