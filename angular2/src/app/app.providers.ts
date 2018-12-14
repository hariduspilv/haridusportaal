import { APP_INITIALIZER, Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RootScopeService, MetaTagsService, TableService, AddressService } from './_services';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from './_core/settings';
import { HttpService } from '@app/_services/httpService';
import { UserService } from '@app/_services/userService';

import { LOCATION_INITIALIZED } from '@angular/common';

export function appInitializerFactory(translate: TranslateService, injector: Injector) {
  return () => new Promise<any>((resolve: any) => {

    const locationInitialized = injector.get(LOCATION_INITIALIZED, Promise.resolve(null));
    locationInitialized.then(() => {
      
      let langToSet = window.location.pathname.split("/")[1];
      if( langToSet == "" ) { langToSet = "et"; }
      if( langToSet !== "" && !['et', 'en'].includes(langToSet) ){ window.location.href = '/404'; }
      translate.use(langToSet).subscribe(() => {
        console.info(`Successfully initialized '${langToSet}' language.'`);
      }, err => {
        console.error(`Problem with '${langToSet}' language initialization.'`);
      }, () => {
        resolve(null);
      });
    });
  });
}

export const AppProviders = [
  RootScopeService,
  MetaTagsService,
  SettingsService,
  TableService,
  HttpService,
  AddressService,
  UserService,
  {
    provide: APP_INITIALIZER,
    useFactory: appInitializerFactory,
    deps: [TranslateService, Injector],
    multi: true
  }

]