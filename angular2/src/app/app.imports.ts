import { AgmKmlLayer } from '@agm/core';

import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from './_core/material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material';

import { RecaptchaModule } from 'ng-recaptcha';
import { RecaptchaFormsModule } from 'ng-recaptcha/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { EmbedVideo } from 'ngx-embed-video';

/* Custom imports */
import { AppModules } from './_components';
import { AppPipes } from './_pipes';
import { AppRoutingModule } from './app.routing.module';
import { AppDirectives } from './_directives';
import { AgmCoreModule } from '@agm/core';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';

import { TextareaAutosizeModule } from 'ngx-textarea-autosize';
import { NgSelectModule } from '@ng-select/ng-select';
import { ClipboardModule } from 'ngx-clipboard';

/* Translate module */
import {HttpClientModule, HttpClient} from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  let localAddress = ['192', '10'];
  let translateUrls = {
    "localhost": ["http://test-htm.wiseman.ee:30000/translations?_format=json&lang=", ""],
    // "localhost": ["https://api.hp.edu.ee/translations?_format=json&lang=", ""],
    "htm.twn.ee": ["http://test-htm.wiseman.ee:30000/translations?_format=json&lang=", ""],
    // "htm.twn.ee": ["https://htm.wiseman.ee/translations?_format=json&lang=", ""],
    "edu.ee": ["https://api.hp.edu.ee/translations?_format=json&lang=", ""],
    "www.edu.ee": ["https://api.hp.edu.ee/translations?_format=json&lang=", ""],
    "test.edu.ee": ["https://apitest.hp.edu.ee/translations?_format=json&lang=", ""],
    "otherwise": ["https://api.hp.edu.ee/translations?_format=json&lang=", ""]
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

export const AppImports = [
  ClipboardModule,
  BrowserModule,
  HttpClientModule,
  TranslateModule.forRoot({
    loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
    }
  }),
  Ng2GoogleChartsModule,
  MaterialModule,
  AppModules,
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
]