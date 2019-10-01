import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, LOCALE_ID } from '@angular/core';
import { AppComponent } from '@app/app.component';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@app/_modules/translate';
// tslint:disable-next-line: import-name
import localeEt from '@angular/common/locales/et';
import { registerLocaleData } from '@angular/common';
import { UserService } from './_services';
// We dont need short month names at all!
localeEt[5][1] = localeEt[5][2].map((item) => {
  return item.charAt(0).toUpperCase() + item.slice(1);
});

registerLocaleData(localeEt);

const routes: Routes = [
  {
    path: '',
    loadChildren: './_views/frontpage#FrontpageViewModule',
  },
  {
    path: 'article',
    loadChildren: './_views/article#ArticleViewModule',
  },
];

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    TranslateModule.forRoot()
  ],
  providers: [
    { provide: LOCALE_ID, useValue:'et-EE' },
    UserService,
  ],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule { }
