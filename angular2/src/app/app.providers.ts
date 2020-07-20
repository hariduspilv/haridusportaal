import { APP_INITIALIZER, Injector, LOCALE_ID } from '@angular/core';
import { RootScopeService, ScrollRestorationService, MetaTagsService, TableService, AddressService } from '@app/_services';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from './_services/settings.service';
import { HttpService } from '@app/_services/httpService';
import { UserService } from '@app/_services/userService';
import { NotificationService } from '@app/_services/notificationService';

import { RECAPTCHA_LANGUAGE } from 'ng-recaptcha';
 
import { LOCATION_INITIALIZED, registerLocaleData } from '@angular/common';
import { CookieService } from './_services/cookieService';

import localeEt from '@angular/common/locales/et';
import { AuthGuard } from './_services/authGuard';

registerLocaleData(localeEt);

export function appInitializerFactory(translate: TranslateService, injector: Injector) {
  return () => new Promise<any>((resolve: any) => {

    const locationInitialized = injector.get(LOCATION_INITIALIZED, Promise.resolve(null));
    locationInitialized.then(() => {

      /*
      let langToSet = window.location.pathname.split("/")[1];
      if( langToSet == "" ) { langToSet = "et"; }
      if( langToSet !== "" && !['et', 'en'].includes(langToSet) ){ window.location.href = '/404'; }
      */

      let langToSet = "et";
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

export function SettingsProviderFactory(provider: SettingsService) {
  return () => provider.load();
}

export const AppProviders = [
  ScrollRestorationService,
  RootScopeService,
  MetaTagsService,
  SettingsService,
  TableService,
  HttpService,
  AddressService,
  UserService,
  CookieService,
  NotificationService,
  AuthGuard,
  {
    provide: APP_INITIALIZER,
    useFactory: appInitializerFactory,
    deps: [TranslateService, Injector],
    multi: true
  },
  {
    provide: RECAPTCHA_LANGUAGE,
    useValue: 'et'
  },
  {
		provide: APP_INITIALIZER,
		useFactory: SettingsProviderFactory,
		deps: [ SettingsService ],
		multi: true
  },
  { provide: LOCALE_ID, useValue: "et" }

]