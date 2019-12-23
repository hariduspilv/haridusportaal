import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivate,
  ActivatedRoute,
} from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { SettingsService } from './SettingsService';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements CanActivate {
  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private settings: SettingsService,
  ) {
    this.isAuthenticated.next(this.isLoggedIn());
  }

  public isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public user: any = {};

  get userData() {
    return this.user;
  }

  set userData(data) {
    this.user = data;
  }

  public login(data: any) {
    return this.http
      .post(`${this.settings.url}/api/v1/token?_format=json`, data)
      .pipe(map((response:any) => {
        if (response['token']) {
          sessionStorage.setItem('token', response['token']);
          this.isAuthenticated.next(true);
          this.userData = this.decodeToken(response.token);
          const redirectUrl = this.route.snapshot.queryParamMap.get('redirect');
          this.router.navigateByUrl(redirectUrl || '/töölaud', { replaceUrl: !!(redirectUrl) });
        } else {
          sessionStorage.removeItem('token');
        }
        return response;
      }));
  }

  public logout() {
    sessionStorage.removeItem('token');
    this.isAuthenticated.next(false);
    this.router.navigateByUrl('/');
  }

  public isLoggedIn() {
    if (!sessionStorage.getItem('token')) {
      if (this.isAuthenticated.getValue()) {
        this.isAuthenticated.next(false);
      }
      return false;
    }
    if (this.isTokenExpired()) {
      sessionStorage.removeItem('token');
      if (this.isAuthenticated.getValue()) {
        this.isAuthenticated.next(false);
      }
      return false;
    }
    this.refreshUser();
    return true;
  }

  public refreshUser(newToken:any = false) {
    if (newToken) {
      sessionStorage.setItem('token', newToken);
    }
    const token = sessionStorage.getItem('token');
    this.userData = this.decodeToken(token);
    if (!this.isAuthenticated.getValue()) {
      this.isAuthenticated.next(true);
    }
  }

  private decodeToken(token) {
    const payload = JSON.parse(
      decodeURIComponent(
        escape(
          atob(token.split('.')[1]),
        ),
      ),
    );
    return payload;
  }

  private isTokenExpired() {
    const token = sessionStorage.getItem('token');
    const tokenPayload = this.decodeToken(token);
    if (Date.now() >= tokenPayload.exp * 1000) {
      return true;
    }
    return false;
  }

  public canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/auth'], {
        queryParams: { redirect: decodeURIComponent(state.url) },
      });
    }
    return true;
  }
}
