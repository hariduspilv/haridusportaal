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

  createAuthorizationHeader(headers) {

    const token = localStorage.getItem('token');
    if (token){

      const helper = new JwtHelperService();

      const decodedToken = helper.decodeToken(token);
      const isExpired = helper.isTokenExpired(token);
      
      if( isExpired ){
        localStorage.removeItem('token');
      }else{
        headers.append('Authorization', `Bearer ${token}`);
      }
      
    }
  }

  parseUrl(url){
    if( !url.match(/.*\s*:\/\/\s*/) ){
      return this.settings.url+url;
    }else{
      return url;
    }
  }

  get(url) {
    url = this.parseUrl(url);
    let headers = new HttpHeaders();
    this.createAuthorizationHeader(headers);
    return this.http.get(url, {
      headers: headers
    });
  }

  post(url, data) {
    url = this.parseUrl(url);
    let headers = new HttpHeaders();
    this.createAuthorizationHeader(headers);
    return this.http.post(url, data, {
      headers: headers
    });
  }
}