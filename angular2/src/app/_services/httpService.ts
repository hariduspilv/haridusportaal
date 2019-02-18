import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { SettingsService } from '@app/_core/settings';

import { Observable } from 'rxjs/Observable';
import { throwError } from 'rxjs';

@Injectable()
export class HttpService {

  constructor(
    private http: HttpClient,
    private settings: SettingsService
  ) {}

  createAuthorizationHeader() {

    let headers = new HttpHeaders();
    const token = sessionStorage.getItem('token');

    headers = headers.append('Cache-Control', 'no-cache');
    headers = headers.append('Pragma', 'no-cache');
    headers = headers.append('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
    headers = headers.append('If-Modified-Since', '0');
    
    if (token){

      const helper = new JwtHelperService();

      const decodedToken = helper.decodeToken(token);
      const isExpired = helper.isTokenExpired(token);
      if( isExpired ){
        sessionStorage.removeItem('token');
      }else{
        headers = headers.append('Authorization', "Bearer " + token);
      }
    }
    
    return headers;

  }

  parseUrl(url){
    if( !url.match(/.*\s*:\/\/\s*/) && !url.match("/assets") ){
      url = this.settings.url+url;
    }

    return encodeURI( url );
  }

  get(url, options:any = {} ) {

    if( this.settings.requests[url] ){
      url = '/graphql?queryName='+url+'&queryId='+this.settings.requests[url];
      if( options.params ){
        url+= '&variables='+JSON.stringify( options.params );
      }
    }

    url = this.parseUrl(url);

    let headers = this.createAuthorizationHeader();

    if( options['withCredentials']  ){
      headers.delete('Authorization');
    }

    return this.http.get(url, {

      headers: headers
    }).catch((err) => {

      return throwError(err);
    });
  }

  post(url, data) {
    const xcsrf = sessionStorage.getItem('xcsrfToken');
    url = this.parseUrl(url);
    let headers = this.createAuthorizationHeader();
    headers = headers.append('X-CSRF-TOKEN', xcsrf);
    
    return this.http.post(url, data, {
      headers: headers
    });
  }
  fileUpload(url, data){
    url = this.parseUrl(url);
    let headers = this.createAuthorizationHeader();
    headers = headers.append('Accept', 'application/json');

    return this.http.post(url, data, {
      headers: headers
    });
  }
}