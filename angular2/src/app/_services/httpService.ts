import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { SettingsService } from '@app/_services/settings.service';

import { Observable } from 'rxjs/Observable';
import { throwError } from 'rxjs';
import { Notification, NotificationType } from '../_components/notifications/notification.model';
import { NotificationService } from './notificationService';

@Injectable()
export class HttpService {

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
    private notificationService: NotificationService
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

  xcsrf() {
    return this.http.get(this.settings.url + '/session/token', {responseType: 'text'});
  }

  parseUrl(url){
    if( !url.match(/.*\s*:\/\/\s*/) && !url.match("/assets") ){
      url = this.settings.url+url;
    }

    return encodeURI( url );
  }

  get(url, options:any = {} ) {

    if( this.settings.data.request[url] ){
      url = '/graphql?queryName='+url+'&queryId='+this.settings.data.request[url]+':1';
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

      headers: headers,
      withCredentials: options['withCredentials'] || false
    }).catch((err) => {
      if(err.status === 404){
        this.notificationService.notify(
          new Notification({
            message: 'errors.request',
            type: NotificationType.Error,
            id: 'global',
            closeable: true,
            httpStatus: 404,
          })
        );
      }
      if(err.status === 0){
        this.notificationService.notify(
          new Notification({
            message: 'errors.no_internet',
            type: NotificationType.Error,
            id: 'global',
            closeable: true,
            httpStatus: 0,
          })
        );
      }
      return throwError(err);
    });
  }

  post(url, data) {
    let xcsrf = sessionStorage.getItem('xcsrfToken');
    url = this.parseUrl(url);
    let headers = this.createAuthorizationHeader();
    if (!xcsrf) {
      this.xcsrf().subscribe(data => {
        let xcsrf = data;
        headers = headers.append('X-CSRF-TOKEN', xcsrf);
      });
    } else {
      headers = headers.append('X-CSRF-TOKEN', xcsrf);
    }
    return this.http.post(url, data, {
      headers: headers
    });
  }

  fileUpload(url, data, filename){
    url = this.parseUrl(url);
    let headers = this.createAuthorizationHeader();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('Content-Type', 'application/octet-stream');
    headers = headers.append('Content-Disposition', 'file; filename="'.concat(filename, '"'));

    return this.http.post(url, data, {
      headers: headers
    });
  }
}