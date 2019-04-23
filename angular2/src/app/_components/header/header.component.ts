import { Component, Input, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { SideMenuService, RootScopeService } from '@app/_services';
import { Router, Event, NavigationEnd, RoutesRecognized } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HttpService } from '@app/_services/httpService';
import { SettingsService } from '@app/_services/settings.service';
import { MatDialog } from '@angular/material';
import { SearchModal } from '../dialogs/search.modal/search.modal';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})


export class HeaderComponent {

  @Input() wasClicked: boolean;
  hideElement = true;
  searchParam: any;
  languages: any;
  logoLink: any;
  activeLanguage: any;
  public suggestionSubscription: Subscription;
  public suggestionList: any = false;
  public debouncer: any;
  public autocompleteLoader: boolean = false;
  public dialogOpened: boolean = false;
  

  constructor(
    private sidemenu: SideMenuService,
    private rootScope: RootScopeService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
    private http: HttpService,
    private settings: SettingsService,
    private dialog: MatDialog,
  ) {

    this.logoLink = "/";

    router.events.subscribe( (event: Event) => {
      if (event instanceof RoutesRecognized) {

        let params = event.state.root.firstChild.params;
        this.activeLanguage = this.rootScope.get("lang");
      }
      if (event instanceof NavigationEnd) {
        // var partials = ['/et', '/en', '/ru', '/'];
        // partials.includes(event.url) || 
        this.hideElement = event.url.includes('/otsing');
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

  toggleSearch() {
    if (!this.dialogOpened) {
      this.dialog.closeAll();
      let dialogRef = this.dialog.open(SearchModal, {
        panelClass: 'sticky-dialog-container',
        backdropClass: 'sticky-dialog-backdrop'
      });
      if (dialogRef['_overlayRef'].overlayElement) {
        dialogRef['_overlayRef'].overlayElement.parentElement.className += ' sticky-dialog-wrapper';
        this.dialogOpened = true;
        dialogRef.afterClosed().subscribe(result => this.dialogOpened = false);
      }
    }
  }

  toggleSideNav(): void {
    this.sidemenu.sendMessage();
  }


  searchRoute(searchParam) {
    if (!searchParam) {searchParam = ''}
    let url = "/otsing?term=" + searchParam;
    this.searchParam = '';
    this.router.navigateByUrl(url)
  }

  populateSuggestionList(searchText, debounceTime) {

    if( !searchText ){ searchText = ''; }

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

      let variables = {
        search_term: searchText
      }
      this.suggestionSubscription = this.http.get('testAutocomplete', {params:variables}).subscribe(res => {
        this.autocompleteLoader = false;
        this.suggestionList = res['data']['CustomElasticAutocompleteQuery'] || [];
        this.suggestionSubscription.unsubscribe();
      });

    }, debounceTime)
  }


}
