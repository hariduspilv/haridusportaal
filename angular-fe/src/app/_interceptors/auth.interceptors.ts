import { Injectable, ɵConsole } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '@app/_services';

@Injectable()
export class AuthInterceptor implements HttpInterceptor{

  constructor(
    private authService: AuthService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let request = req.clone();
    request = this.addAuthToken(request);
    return next.handle(request);
  }

  private addAuthToken(req: HttpRequest<any>): HttpRequest<any> {
    let request = req.clone();
    if (this.authService.isLoggedIn()) {
      const token: string = localStorage.getItem('token');
      request = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`),
      });
    }
    return request;
  }
}
