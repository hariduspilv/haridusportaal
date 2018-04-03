import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component } from '@angular/core';
import { MaterialModule } from './_shared/material.module';
import { AppComponent } from './app.component';
import { GraphQLModule } from './_shared/graphql.module';

/* Custom imports */
import { AppModules } from './_modules';
import { AppPipes } from './_pipes';
import { AppRoutingModule, routedComponents } from './app.routing.module';

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
    AppRoutingModule
  ],

  exports: [

  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
