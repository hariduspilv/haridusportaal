import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component, APP_INITIALIZER, Injector } from '@angular/core';
import { MaterialModule } from './_core/material.module';
import { AppComponent } from './app.component';
import { GraphQLModule } from './_core/graphql.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material';

import { RecaptchaModule } from 'ng-recaptcha';
import { RecaptchaFormsModule } from 'ng-recaptcha/forms';

import { RootScopeService, NewsService, MetaTagsService, TableService } from './_services';
import { EventsRegistratonDialog } from './_components/dialogs/events.registration/events.registration.dialog';
import { ImagePopupDialog } from './_components/dialogs/image.popup/image.popup.dialog';
import { Modal } from './_components/dialogs/modal/modal';
import { TableModal } from './_components/dialogs/table.modal/table.modal';
import { VideoComponent } from './_components/video/video.component';
import { HttpModule, JsonpModule } from '@angular/http';
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
import { TranslateModule, TranslateLoader, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LOCATION_INITIALIZED } from '@angular/common';
import { BreadcrumbsComponent } from './_components/breadcrumbs/breadcrumbs.component';
import { ShareComponent } from './_components/share/share.component';
import { SearchComponent } from './_views/search/search.component';

import { SettingsService } from './_core/settings';
import { SchoolStudyProgrammesComponent } from './_components/school.study.programmes/school.study.programmes.component';
import { MapWrapperComponent } from './_components/map.wrapper/map.wrapper.component';
import { CompareComponent } from './_components/compare/compare.component';
import { RelatedStudyProgrammesComponent } from './_components/related.studyProgrammes/related.studyProgrammes.component';
import { StudyProgrammeCompareComponent } from './_views/studyProgramme.compare/studyProgramme.compare.component';
import { RecentEventsComponent } from './_components/recent.events/recent.events.component';
import { FavouritesComponent } from './_components/favourites/favourites.component';
import { FavouritesListComponent } from './_components/favouritesList/favouritesList.component';

import { HttpService } from '@app/_services/httpService';
import { UserService } from '@app/_services/userService';
import { CertificatesComponent } from '@app/_components/certificates/certificates.component';
import { CertificatesDetailedComponent } from '@app/_components/certificates.detailed/certificates.detailed.component';
import { TeachingsDetailedComponent } from '@app/_components/teachings.detailed/teachings.detailed.component';

import { ApplicationsComponent } from '@app/_components/applications/applications.component';
import { StudiesComponent } from '@app/_components/studies/studies.component';
import { TeachingsComponent } from '@app/_components/teachings/teachings.component';
import { XjsonComponent } from '@app/_views/xjson/xjson.component';
import { ConfirmPopupDialog } from '@app/_components/dialogs/confirm.popup/confirm.popup.dialog';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  let localAddress = ['192', '10'];
  let translateUrls = {
    "localhost": ["/assets/", ".json"],

    //"localhost": ["http://test-htm.wiseman.ee:30000/", "/base_settings?_format=json"],
    // "htm.twn.ee": ["/assets/", ".json"],
    "htm.twn.ee": ["http://test-htm.wiseman.ee:30000/", "/translations?_format=json"],
    "otherwise": ["https://api.test.edu.ee/", "/translations?_format=json"]
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

export function appInitializerFactory(translate: TranslateService, injector: Injector) {
  return () => new Promise<any>((resolve: any) => {
    const locationInitialized = injector.get(LOCATION_INITIALIZED, Promise.resolve(null));
    locationInitialized.then(() => {
      const langToSet = 'et'
      translate.use(langToSet).subscribe(() => {
        console.info(`Successfully initialized '${langToSet}' language.'`);
      }, err => {
        console.error(`Problem with '${langToSet}' language initialization.'`);
      }, () => {
        resolve(null);
      });
    });
  });
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
    TableModal,
    VideoComponent,
    SchoolStudyProgrammesComponent,
    StudyProgrammeCompareComponent,
    MapWrapperComponent,
    CompareComponent,
    RelatedStudyProgrammesComponent,
    RecentEventsComponent,
    FavouritesComponent,
    FavouritesListComponent,
    CertificatesComponent,
    CertificatesDetailedComponent,
    TeachingsDetailedComponent,
    ApplicationsComponent,
    StudiesComponent,
    TeachingsComponent,
    XjsonComponent,
    SearchComponent,
    ConfirmPopupDialog   
  ],

  entryComponents: [ EventsRegistratonDialog, ImagePopupDialog, TableModal, Modal, VideoComponent, StudyProgrammeCompareComponent, ConfirmPopupDialog],

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
    MatSnackBarModule,
    AgmJsMarkerClustererModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyD0sqq4HN0rVOzSvsMmLhFerPYO67R_e7E'
    }),
    AgmSnazzyInfoWindowModule,
    HttpModule,
    JsonpModule,
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
    TableService,
    HttpService,
    UserService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService, Injector],
      multi: true
    }
  ],

  exports: [
    
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
