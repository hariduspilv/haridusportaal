import { DOCUMENT } from '@angular/platform-browser';
import { Inject } from '@angular/core';

export class SettingsService {

  login = "/et/api/v1/token?_format=json";

  url = "";

  /* !!! ALSO CHANGE IN HTTPFACTORY!!! */
  /*
  urlTemplates = {
    "localhost": "http://htm.wiseman.ee",
    "htm.twn.ee": "http://htm.wiseman.ee",
    "10.0.2.2": "http://htm.wiseman.ee",
    "192.168.6.193": "http://htm.wiseman.ee", //Virtualbox local IP
    "otherwise": "https://apitest.hp.edu.ee"
  }
  */
  urlTemplates = {
    "localhost": "http://htm.wiseman.ee",
    "htm.twn.ee": "http://htm.wiseman.ee",
    "10.0.2.2": "http://htm.wiseman.ee",
    "192.168.1.5": "http://htm.wiseman.ee", //Virtualbox local IP
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