import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, LOCALE_ID } from '@angular/core';
import { AppComponent } from '@app/app.component';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@app/_modules/translate';
// tslint:disable-next-line: import-name
import localeEt from '@angular/common/locales/et';
import { registerLocaleData } from '@angular/common';
import { AssetsModule } from './_assets';
import { SettingsService } from './_services';
import { RoutesModule } from './app.routes';
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
    TranslateModule.forRoot(),
  ],
  providers: [
    { provide: LOCALE_ID, useValue:'et-EE' },
  ],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule { }
