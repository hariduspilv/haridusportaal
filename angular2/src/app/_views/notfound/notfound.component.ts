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
  translatedLinks: object = {
    school: {et: '/kool'},
    events: {et: '/sündmused'},
    news: {et: '/uudised'}
  }

  constructor(
    private translate: TranslateService,
    private rootScope: RootScopeService,
    private sidemenu: SideMenuService,
    private router: Router) {
  }
  
  ngOnInit() {
    this.sidemenu.triggerLang(true);
    document.getElementById('toFront').focus();
  }

  getLang() {
    return this.rootScope.get('lang');
  }

  toFrontpage() {
    return `/`;
  }

  constructUrl(type) {
    return this.translatedLinks[type][this.getLang()]
  }

}