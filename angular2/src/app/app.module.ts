import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component } from '@angular/core';
import { MaterialModule } from './_core/material.module';
import { AppComponent } from './app.component';
import { GraphQLModule } from './_core/graphql.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { RecaptchaModule } from 'ng-recaptcha';
import { RecaptchaFormsModule } from 'ng-recaptcha/forms';

import { RootScopeService, NewsService, MetaTagsService, TableService } from './_services';
import { EventsRegistratonDialog } from './_components/dialogs/events.registration/events.registration.dialog';
import { ImagePopupDialog } from './_components/dialogs/image.popup/image.popup.dialog';
import { Modal } from './_components/dialogs/modal/modal';
import { VideoComponent } from './_components/video/video.component';
import { HttpModule } from '@angular/http';
import { EmbedVideo } from 'ngx-embed-video';

/* Custom imports */
import { AppModules } from './_components';
import { AppPipes } from './_pipes';
import { AppRoutingModule, routedComponents } from './app.routing.module';
import { AppDirectives } from './_directives';
import { AgmCoreModule } from '@agm/core';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';

import { TextareaAutosizeModule } from 'ngx-textarea-autosize';
import { NgSelectModule } from '@ng-select/ng-select';

/* Translate module */
import {HttpClientModule, HttpClient} from '@angular/common/http';
import {TranslateModule, TranslateLoader, TranslatePipe} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { BreadcrumbsComponent } from './_components/breadcrumbs/breadcrumbs.component';
import { ShareComponent } from './_components/share/share.component';

import { SettingsService } from './_core/settings';
import { SchoolStudyProgrammesComponent } from './_components/school.study.programmes/school.study.programmes.component';
import { MapWrapperComponent } from './_components/map.wrapper/map.wrapper.component';
import { CompareComponent } from './_components/compare/compare.component';
import { RelatedStudyProgrammesComponent } from './_components/related.studyProgrammes/related.studyProgrammes.component';
import { StudyProgrammeCompareComponent } from './_views/studyProgramme.compare/studyProgramme.compare.component';
import { RecentEventsComponent } from './_components/recent.events/recent.events.component';
import { FavouritesComponent } from './_components/favourites/favourites.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  let localAddress = ['192', '10'];
  let translateUrls = {
    "localhost": ["/assets/", ".json"],
    //"localhost": ["http://test-htm.wiseman.ee:30000/", "/base_settings?_format=json"],
    //"htm.twn.ee": ["/assets/", ".json"],
    "htm.twn.ee": ["http://test-htm.wiseman.ee:30000/", "/base_settings?_format=json"],
    "otherwise": ["https://api.test.edu.ee/", "/base_settings?_format=json"]
  }

  let path;
  
  if( translateUrls[document.domain] ) {
    path = translateUrls[document.domain];

  } else if(localAddress.some(octet => document.domain.includes(octet))) {
    path = translateUrls['localhost'];

  } else {
    path = translateUrls.otherwise;
  }
 
  return new TranslateHttpLoader(http, path[0], path[1]);
}

@NgModule({

  declarations: [
    AppComponent,
    routedComponents,
    EventsRegistratonDialog,
    ImagePopupDialog,
    BreadcrumbsComponent,
    ShareComponent,
    Modal,
    VideoComponent,
    SchoolStudyProgrammesComponent,
    StudyProgrammeCompareComponent,
    MapWrapperComponent,
    CompareComponent,
    RelatedStudyProgrammesComponent,
    RecentEventsComponent,
    FavouritesComponent
  ],

  entryComponents: [ EventsRegistratonDialog, ImagePopupDialog, Modal, VideoComponent, StudyProgrammeCompareComponent],

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
    AgmJsMarkerClustererModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyD0sqq4HN0rVOzSvsMmLhFerPYO67R_e7E'
    }),
    AgmSnazzyInfoWindowModule,
    HttpModule,
    EmbedVideo.forRoot(),
    TextareaAutosizeModule,
    RecaptchaModule.forRoot(),
    RecaptchaFormsModule
  ],

  providers: [
    RootScopeService,
    NewsService,
    MetaTagsService,
    SettingsService,
    TableService
  ],

  exports: [
    
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
