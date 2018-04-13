import { Component } from '@angular/core';
import { RootScopeService } from '../../_services';

@Component({
  templateUrl: './frontpage.component.html'
})

export class FrontpageComponent {
  constructor (private rootScope:RootScopeService) {
    this.rootScope.set('langOptions', {
      'en': '/en',
      'et': '/et',
    });
  }
}
