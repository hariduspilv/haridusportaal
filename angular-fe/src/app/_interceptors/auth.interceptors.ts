import { Injectable, ɵConsole } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService, SettingsService } from '@app/_services';

@Injectable()
export class AuthInterceptor implements HttpInterceptor{

  constructor(
    private authService: AuthService,
    private settings: SettingsService,
  ) {}

  private ehisUrls = ['/messages/messages/receiver', 'certificates/v1/'];
  private urlsWithNoHeaders = ['/es-public/'];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let request = req.clone();
    request = this.addAuthToken(request);
    return next.handle(request);
  }

  private addAuthToken(req: HttpRequest<any>): HttpRequest<any> {
    let request = req.clone();

    let headers = request.headers;

    /*if (this.authService.isLoggedIn() && !request.url.match(`${this.settings.url}/ehis/jwt`)) {
      const token: string = sessionStorage.getItem('token');
      headers = headers
        .set('Authorization', `Bearer ${token}`);
    }

    if (
      this.authService.isLoggedIn() &&
      request.url.includes('/messages/messages/receiver')
    ) {
      const token = sessionStorage.getItem('ehisToken');
      headers = headers
      .set('Authorization', `Bearer ${token}`);
    }*/

    if (
      this.authService.isLoggedIn()
       && !request.url.match(`${this.settings.url}/ehis/jwt`)
    ) {
      let token;
      if (this.ehisUrls.some(url => request.url.includes(url))) {
        token = sessionStorage.getItem('ehisToken');
      } else {
        token = sessionStorage.getItem('token');
      }
      headers = headers
      .set('Authorization', `Bearer ${token}`);
    }

    // for some reason extra headers kill preflight request to elasticsearch
    if (this.urlsWithNoHeaders.some(url => request.url.includes(url))) {
      headers = headers.delete('Authorization');
    } else {
      headers = headers
      .set('Cache-Control', 'no-cache')
      .set('Pragma', 'no-cache')
      .set('Expires', '-1');
    }

    request = request.clone({
      headers,
    });

    return request;
  }
}
