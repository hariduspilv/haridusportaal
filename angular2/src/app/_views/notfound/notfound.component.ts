import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RootScopeService, SideMenuService } from '@app/_services'
import { Router } from '@angular/router';

@Component({
  templateUrl: './notfound.component.html',
  styleUrls: ['./notfound.component.scss']
})

export class NotFoundComponent {

  viewTranslations: any;
  loaded: boolean = false;
  translatedLinks: object = {
    school: {et: '/et/kool', en: '/en/school'},
    events: {et: '/et/sundmused', en: '/en/events'},
    news: {et: '/et/uudised', en: '/en/news'}
  }

  constructor(private translate: TranslateService, private rootScope: RootScopeService, private sidemenu: SideMenuService, private router: Router) {
    let langString = this.router.url && this.router.url.split('/').length > 1 && this.router.url.split('/')[1] ? this.router.url.split('/')[1] : 'et';
    langString = langString === 'et' || langString === 'en' ? langString : 'et';
    this.rootScope.set('currentLang', langString);
  }
  
  ngOnInit() {
    this.sidemenu.triggerLang(true);
    this.loaded = true;
  }

  getLang() {
    return this.rootScope.get('currentLang');
  }

  toFrontpage() {
    return "/" + this.getLang();
  }

  constructUrl(type) {
    return this.translatedLinks[type][this.getLang()]
  }

}