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

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let request = req.clone();
    request = this.addAuthToken(request);
    return next.handle(request);
  }

  private addAuthToken(req: HttpRequest<any>): HttpRequest<any> {
    let request = req.clone();
    if (this.authService.isLoggedIn() && !request.url.match(`${this.settings.url}/ehis/jwt`)) {
      const token: string = sessionStorage.getItem('token');
      request = request.clone({
        headers: request.headers
          .set('Authorization', `Bearer ${token}`)
          .set('Cache-Control', 'no-cache')
          .set('Pragma', 'no-cache')
          .set('Expires', '0'),
      });
    }
    return request;
  }
}
