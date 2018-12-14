import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { SettingsService } from '@app/_core/settings';

@Injectable()
export class HttpService {

  constructor(
    private http: HttpClient,
    private settings: SettingsService
  ) {}

  createAuthorizationHeader() {

    let headers = new HttpHeaders();
    const token = localStorage.getItem('token');

    if (token){

      const helper = new JwtHelperService();

      const decodedToken = helper.decodeToken(token);
      const isExpired = helper.isTokenExpired(token);
      if( isExpired ){
        localStorage.removeItem('token');
      }else{
        headers = headers.append('Authorization', "Bearer " + token);
      }

      headers = headers.append('Cache-Control', 'no-cache');
    
    }
    
    return headers;

  }

  parseUrl(url){
    if( !url.match(/.*\s*:\/\/\s*/) && !url.match("/assets") ){
      url = this.settings.url+url;
    }

    return encodeURI( url );
  }

  get(url, inputHeaders:object = {} ) {

    url = this.parseUrl(url);

    let headers = this.createAuthorizationHeader();

    if( inputHeaders['withCredentials']  ){
      headers.delete('Authorization');
    }

    return this.http.get(url, {
      headers: headers,
      withCredentials: inputHeaders['withCredentials'] || false
    });
  }

  post(url, data) {
    const xcsrf = localStorage.getItem('xcsrfToken');
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