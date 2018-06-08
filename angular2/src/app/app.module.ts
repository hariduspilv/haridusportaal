import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component } from '@angular/core';
import { MaterialModule } from './_core/material.module';
import { AppComponent } from './app.component';
import { GraphQLModule } from './_core/graphql.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ArticleService, EventsService, RootScopeService, NewsService } from './_services';


import { EventsRegistratonDialog } from './_components/dialogs/events.registration/events.registration.dialog'

/* Custom imports */
import { AppModules } from './_components';
import { AppPipes } from './_pipes';
import { AppRoutingModule, routedComponents } from './app.routing.module';
import { AppDirectives } from './_directives';
import { AgmCoreModule } from '@agm/core';

import { NgSelectModule } from '@ng-select/ng-select';

/* Translate module */
import {HttpClientModule, HttpClient} from '@angular/common/http';
import {TranslateModule, TranslateLoader, TranslatePipe} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { BreadcrumbsComponent } from './_components/breadcrumbs/breadcrumbs.component';
// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {

  let localPath = true;
  let path = ["http://test-htm.wiseman.ee:30000/", "/base_settings?_format=json"];

  if( localPath ){
    path = ["/assets/", ".json"];
  }

  return new TranslateHttpLoader(http, path[0], path[1]);
}

@NgModule({

  declarations: [
    AppComponent,
    routedComponents,
    EventsRegistratonDialog,
    BreadcrumbsComponent
  ],

  entryComponents: [ EventsRegistratonDialog ],

  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
        }
    }),
    MaterialModule,
    AppModules,
    GraphQLModule,
    AppRoutingModule,
    AppDirectives,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    AppPipes,
    AgmCoreModule.forRoot({
      apiKey: ' AIzaSyD0sqq4HN0rVOzSvsMmLhFerPYO67R_e7E'
    })
  ],

  providers: [
    ArticleService,
    EventsService,
    RootScopeService,
    NewsService
  ],

  exports: [
    
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
