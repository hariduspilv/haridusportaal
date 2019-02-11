import { DOCUMENT } from '@angular/platform-browser';
import { Inject } from '@angular/core';

import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';

export class SettingsService {

  login = "/api/v1/token?_format=json";

  url = "";

  urlTemplates = {
    "localhost": "http://test-htm.wiseman.ee:30000",
    "htm.twn.ee": "https://htm.wiseman.ee",
    "edu.ee": "https://api.hp.edu.ee",
    "www.edu.ee": "https://api.hp.edu.ee",
    "10.0.2.2": "https://htm.wiseman.ee",
    "192.168.1.5": "https://htm.wiseman.ee", //Virtualbox local IP
    "test.edu.ee": "https://apitest.hp.edu.ee",
    "otherwise": "https://api.hp.edu.ee"
  }

  error: boolean = false;
  
	data: any;

  constructor(
    @Inject(DOCUMENT) private document,
    private http: HttpClient  
  ) {

    if( this.urlTemplates[document.domain] ) {
      this.url = this.urlTemplates[document.domain];
    }else{
      this.url = this.urlTemplates.otherwise;
    }
  }

  get( key:string = '' ) {
		if( !this.data ){
			return undefined;
		}
		return this.data[key] || undefined;
	}

	load() {
		return new Promise((resolve, reject) => {
			this.http.get(this.url+'/translations?_format=json&lang=et&settings=true').subscribe(response => {
				this.data = response;
				resolve(true);
			}, () => {
				this.error = true;
				resolve(true);
			});
		})
	}

}