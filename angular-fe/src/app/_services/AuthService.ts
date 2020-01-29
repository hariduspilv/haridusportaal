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
  public hasEhisToken: BehaviorSubject<boolean> = new BehaviorSubject(false);
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
          if (this.settings.url === 'https://htm.wiseman.ee') {
            this.testNewJWT(response['token']);
          }
          this.userData = this.decodeToken(response.token);
          this.isAuthenticated.next(true);
        } else {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('ehisToken');
          sessionStorage.removeItem('redirectUrl');
        }
        return response;
      }));
  }

  public testNewJWT(token) {
    const data = {
      jwt: token,
    };
    this.http
    .post(`${this.settings.url}/ehis/jwt`, data).subscribe(
      (response: any) => {
        if (response.jwt) {
          sessionStorage.setItem('ehisToken', response.jwt);
          this.hasEhisToken.next(true);
        }
        const redirectUrl = this.route.snapshot.queryParamMap.get('redirect');
        this.router.navigateByUrl(redirectUrl || '/töölaud', { replaceUrl: !!(redirectUrl) });
      },
      (err) => {
        const redirectUrl = this.route.snapshot.queryParamMap.get('redirect');
        this.router.navigateByUrl(redirectUrl || '/töölaud', { replaceUrl: !!(redirectUrl) });
      }
    );
  }

  public logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('redirectUrl');
    sessionStorage.removeItem('ehisToken');
    this.isAuthenticated.next(false);
    this.hasEhisToken.next(false);
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
      sessionStorage.removeItem('ehisToken');
      sessionStorage.removeItem('redirectUrl');
      if (this.isAuthenticated.getValue()) {
        this.isAuthenticated.next(false);
        this.hasEhisToken.next(false);
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
    if (sessionStorage.getItem('ehisToken')) {
      this.hasEhisToken.next(true);
    }
    this.userData = this.decodeToken(token);
    if (!this.isAuthenticated.getValue()) {
      this.isAuthenticated.next(true);
    }
  }

  public decodeToken(token) {
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

  public expireTime() {
    const token = sessionStorage.getItem('token');
    const tokenPayload = token ? this.decodeToken(token) : {};
    if (tokenPayload.exp) {
      return tokenPayload.exp * 1000;
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
