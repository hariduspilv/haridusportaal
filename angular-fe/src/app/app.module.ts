import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LOCALE_ID, NgModule } from '@angular/core';
import { AppComponent } from '@app/app.component';
import { HTTP_INTERCEPTORS, HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@app/_modules/translate';
import localeEt from '@angular/common/locales/et';
import { Location, registerLocaleData } from '@angular/common';
import { AssetsModule } from './_assets';
import { RoutesModule } from './app.routes';
import { AuthInterceptor } from './_interceptors';
import { AmpService } from './_services/ampService';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { BlobErrorHttpInterceptor } from './_interceptors/blob-error-interceptor';
import { TitleService } from './_services/TitleService';
import { RouteUndefinedInterceptor } from './_interceptors/detail-route-undefined.interceptor';
// We dont need short month names at all!
localeEt[5][1] = localeEt[5][2].map((item) => {
  return item.charAt(0).toUpperCase() + item.slice(1);
});

registerLocaleData(localeEt);

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    RoutesModule,
    AssetsModule.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    TranslateModule.forRoot(),
    DeviceDetectorModule.forRoot(),
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'et-EE' },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: RouteUndefinedInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: BlobErrorHttpInterceptor, multi: true },
    AmpService,
    TitleService,
    Location,
    { provide: 'googleTagManagerId', useValue: 'GTM-WK8H92C' },
  ],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule {
}
