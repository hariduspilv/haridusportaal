import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component } from '@angular/core';
import { MaterialModule } from './_core/material.module';
import { AppComponent } from './app.component';
import { GraphQLModule } from './_core/graphql.module';

import { ArticleService } from './_services';
import { EventsService } from './_services';

/* Custom imports */
import { AppModules } from './_components';
import { AppPipes } from './_pipes';
import { AppRoutingModule, routedComponents } from './app.routing.module';
import { AppDirectives } from './_directives';

@NgModule({

  declarations: [
    AppComponent,
    AppPipes,
    routedComponents
  ],

  imports: [
    BrowserModule,
    MaterialModule,
    AppModules,
    GraphQLModule,
    AppRoutingModule,
    AppDirectives
  ],

  providers: [
    ArticleService,
    EventsService
  ],

  exports: [

  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
