import { Component } from '@angular/core';
import { RootScopeService, MetaTagsService} from '../../_services';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  templateUrl: './frontpage.component.html',
  styleUrls: ['./frontpage.component.scss']
})

export class FrontpageComponent {
  constructor (
    private rootScope:RootScopeService,
    private metaTags: MetaTagsService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute
  ) {

    this.route.params.subscribe( params => {
        
      const defaultLang = translate.getDefaultLang();

      const translations = translate.translations;

      translate.get('frontpage').subscribe((res: string) => {
        metaTags.set([
          {
            "name": "title",
            "content": res
          }
        ]);
      });

    });

    this.rootScope.set('langOptions', {
      'en': '/en',
      'et': '/et',
    });
  }
}
