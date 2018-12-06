import { DOCUMENT } from '@angular/platform-browser';
import { Inject } from '@angular/core';

export class SettingsService {

  login = "/et/api/v1/token?_format=json";

  url = "";

  /* !!! ALSO CHANGE IN HTTPFACTORY!!! */
  /*
  urlTemplates = {
    "localhost": "http://test-htm.wiseman.ee:30000",
    "htm.twn.ee": "http://test-htm.wiseman.ee:30000",
    "10.0.2.2": "http://test-htm.wiseman.ee:30000",
    "192.168.6.193": "http://test-htm.wiseman.ee:30000", //Virtualbox local IP
    "otherwise": "https://apitest.hp.edu.ee"
  }
  */
  urlTemplates = {
    "localhost": "https://htm.wiseman.ee",
    "htm.twn.ee": "https://htm.wiseman.ee",
    "10.0.2.2": "https://htm.wiseman.ee",
    "192.168.6.193": "https://htm.wiseman.ee", //Virtualbox local IP
    "otherwise": "https://apitest.hp.edu.ee"
  }

  constructor(@Inject(DOCUMENT) private document) {

    if( this.urlTemplates[document.domain] ) {
      this.url = this.urlTemplates[document.domain];
    }else{
      this.url = this.urlTemplates.otherwise;
    }
  }

}