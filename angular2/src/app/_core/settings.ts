import { DOCUMENT } from '@angular/platform-browser';
import { Inject } from '@angular/core';

export class SettingsService {

  login = "/et/api/v1/token?_format=json";

  url = "";

  /* !!! ALSO CHANGE IN HTTPFACTORY!!! */
  urlTemplates = {
    "localhost": "http://test-htm.wiseman.ee:30000",
    "htm.twn.ee": "http://test-htm.wiseman.ee:30000",
    "otherwise": "https://api.test.edu.ee"
  }

  constructor(@Inject(DOCUMENT) private document) {

    if( this.urlTemplates[document.domain] ) {
      this.url = this.urlTemplates[document.domain];
    }else{
      this.url = this.urlTemplates.localhost;
    }
    console.log( document.domain + " -> " + this.url );
  }

}