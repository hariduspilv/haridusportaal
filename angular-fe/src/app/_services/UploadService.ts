import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class UploadService {

  constructor(
    private http: HttpClient,
  ) {}

  createAuthorizationHeader() {

    let headers = new HttpHeaders();
    const token = sessionStorage.getItem('token');

    headers = headers.append('Cache-Control', 'no-cache');
    headers = headers.append('Pragma', 'no-cache');
    headers = headers.append('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
    headers = headers.append('If-Modified-Since', '0');

    if (token) {

      const helper = new JwtHelperService();

      const decodedToken = helper.decodeToken(token);
      const isExpired = helper.isTokenExpired(token);
      if (isExpired) {
        sessionStorage.removeItem('token');
      } else {
        headers = headers.append('Authorization', `Bearer ${token}`);
      }
    }

    return headers;

  }

  fileUpload(url, data, filename) {
    let headers = this.createAuthorizationHeader();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('Content-Type', 'application/octet-stream');
    headers = headers.append('Content-Disposition', 'file; filename="'.concat(encodeURIComponent(filename), '"'));

    return this.http.post(url, data, {
      headers,
    });
  }
}