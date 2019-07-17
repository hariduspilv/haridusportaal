import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from './_modules/translate';

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
    TranslateModule.forRoot(),
  ],
  providers: [

  ],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule { }
