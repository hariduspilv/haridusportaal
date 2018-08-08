import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RootScopeService, SideMenuService } from '../../_services'
import { Router } from '@angular/router';

@Component({
  templateUrl: './notfound.component.html',
  styleUrls: ['./notfound.component.scss']
})

export class NotFoundComponent {

  viewTranslations: any;
  content: boolean = false;
  translatedLinks: object = {
    school: {et: '/et/kool', en: '/en/school'},
    events: {et: '/et/sundmused', en: '/en/events'},
    news: {et: '/et/uudised', en: '/en/news'}
  }

  constructor(private translate: TranslateService, private rootScope: RootScopeService, private sidemenu: SideMenuService, private router: Router) {
    let langString = this.router.url && this.router.url.split('/').length > 1 && this.router.url.split('/')[1] ? this.router.url.split('/')[1] : 'et'
    this.rootScope.set('currentLang', langString);
  }
  
  ngOnInit() {
    let values = ['notFound.explanation','frontpage.navigate','event.label','news.label','school.label']
    this.translate.get(values).subscribe(translations => {
      this.viewTranslations = translations;
      this.content = true;
    })
    this.sidemenu.triggerLang(true);
  }

  getLang() {
    return this.rootScope.get('currentLang');
  }

  toFrontpage() {
    return `/${this.getLang()}`
  }

  constructUrl(type) {
    return this.translatedLinks[type][this.getLang()]
  }

}