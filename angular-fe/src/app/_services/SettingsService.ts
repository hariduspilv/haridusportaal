import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(
    @Inject(DOCUMENT) private document,
    private http: HttpClient,
  ) {
    if (this.urlTemplates[document.domain]) {
      this.url = this.urlTemplates[document.domain];
    } else {
      this.url = this.urlTemplates.otherwise;
    }
    if (this.ehisUrlTemplates[document.domain]) {
      this.ehisUrl = this.ehisUrlTemplates[document.domain];
    } else {
      this.ehisUrl = this.ehisUrlTemplates.otherwise;
    }
  }

  public url: string = '';
  public ehisUrl: string = '';
  private urlTemplates = {
    '192.168.6.193': 'https://htm.wiseman.ee',
    'edu.twn.ee': 'https://htm.wiseman.ee',
    'edu.ee': 'https://api.hp.edu.ee',
    'www.edu.ee': 'https://api.hp.edu.ee',
    '10.0.2.2': 'https://htm.wiseman.ee',
    '192.168.72.253': 'https://htm.wiseman.ee',
    'test.edu.ee': 'https://apitest.hp.edu.ee',
    localhost: 'https://htm.wiseman.ee',
    otherwise: 'https://api.hp.edu.ee',
  };

  private ehisUrlTemplates = {
    'edu.twn.ee': 'https://ehis2.twn.zone/api',
    'test.edu.ee': 'https://tehis.edu.ee/api',
    'edu.ee': 'https://ehis.edu.ee/api',
    'www.edu.ee': 'https://ehis.edu.ee/api',
    localhost: 'https://ehis2.twn.zone/api',
    otherwise: 'https://ehis.edu.ee/api',
  };

  public login = '/api/v1/token?_format=json';
  public mobileLogin = '/custom/login/mobile_id?_format=json';
  public error: boolean = false;
  public data: any;
  public compareObservable = new Subject<any>();
  public activeLang: string = 'ET';

  private findObj(obj, path) {
    return path
    .replace(/\[|\]\.?/g, '.')
    .split('.')
    .filter(s => s)
    .reduce((acc, val) => acc && acc[val], obj);
  }

  public query(name: string = '', variables: object = {}) {
    const requestName = this.get(`request.${name}`);
    let path = `${this.url}/graphql?queryName=${name}&queryId=${requestName}`;
    if (Object.keys(variables).length > 0) {
      path = `${path}&variables=${encodeURI(JSON.stringify(variables))}`;
    }
    return path;
  }

  public queryID(name: string = '') {
    return this.get(`request.${name}`);
  }

  public get(key:string = '') {
    this.findObj(this.data, key);
    let output = this.findObj(this.data, key) || undefined;
    if (key.match(/request\./gmi)) {
      output = `${output}:1`;
    }
    return output;
  }

  public load() {
    return new Promise((resolve, reject) => {
      const path = `${this.url}/variables?_format=json&lang=et`;
      this.http.get(path).subscribe(
        (response) => {
          this.data = response;
          resolve(true);
        },
        (err) => {
          this.error = true;
          resolve(true);
        });
    });
  }
}
