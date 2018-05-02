import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component } from '@angular/core';
import { MaterialModule } from './_core/material.module';
import { AppComponent } from './app.component';
import { GraphQLModule } from './_core/graphql.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ArticleService, EventsService, RootScopeService } from './_services';

/* Custom imports */
import { AppModules } from './_components';
import { AppPipes } from './_pipes';
import { AppRoutingModule, routedComponents } from './app.routing.module';
import { AppDirectives } from './_directives';
import { MomentModule } from 'angular2-moment/moment.module';
import { AgmCoreModule } from '@agm/core';

@NgModule({

  declarations: [
    AppComponent,
    routedComponents
  ],

  imports: [
    BrowserModule,
    MaterialModule,
    AppModules,
    GraphQLModule,
    AppRoutingModule,
    AppDirectives,
    MomentModule,
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
    RootScopeService
  ],

  exports: [

  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
