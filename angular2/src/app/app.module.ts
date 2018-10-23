
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppDeclarations, AppEntryComponents } from './app.declarations';
import { AppImports } from './app.imports';
import { AppProviders } from './app.providers';

@NgModule({
  declarations: [ ...AppDeclarations, AppComponent ],
  entryComponents: AppEntryComponents,
  imports: AppImports,
  providers: AppProviders,
  exports: [],
  bootstrap: [AppComponent]
})


export class AppModule { }