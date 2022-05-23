import  { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { SettingsService } from './SettingsService';
import { map, take } from 'rxjs/operators';
import { CookieService } from './CookieService';

@Injectable({
  providedIn: 'root',
})

export class AuthService implements CanActivate {
  /**
   * Determines whether if the user is authenticated
   */
  public isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**
   * Determines whether the user has EHIS token
   */
  public hasEhisToken: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public user: any = {};

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private settings: SettingsService,
    private cookie: CookieService,
  ) {
    this.isAuthenticated.next(this.isLoggedIn());
  }

  /**
   * Gets user data
   */
  get userData() {
    return this.user;
  }

  /**
   * Sets user data
   * User data is decoded from JWT token
   */
  set userData(data) {
    this.user = data;
  }

  /**
   * Logins auth service
   * @param data - Username, Password
   * @returns http Observable
   */
  public login(data: any) {
    return this.http
      .post(`${this.settings.url}/api/v1/token?_format=json`, data)
      .pipe(map((response: any) => {
        if (response['token']) {
          sessionStorage.setItem('token', response['token']);
          this.userData = this.decodeToken(response.token);
          this.testNewJWT(response['token']);
        } else {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('ehisToken');
          sessionStorage.removeItem('redirectUrl');
        }
        this.isAuthenticated.next(this.isLoggedIn());
        return response;
      }));
  }

  /**
   * Tests new JSON web token
   * @param token - jwt token
   */
  public testNewJWT(token) {
    const data = {
      jwt: token,
    };
    this.http
      .post(`${this.settings.ehisUrl}/users/v1/haridusportaal/jwt`, data).subscribe({
        next: (response: any) => {
          if (response.jwt) {
            sessionStorage.setItem('ehisToken', response.jwt);
            this.saveEhisTokenInCookie(response.jwt);
            this.hasEhisToken.next(true);
            this.isAuthenticated.next(true);
          }
          const redirectUrl = this.route.snapshot.queryParamMap.get('redirect') ||
            sessionStorage.getItem('redirectUrl');
          this.router.navigateByUrl(redirectUrl || '/töölaud', { replaceUrl: !!(redirectUrl) });
        },
        error: (err) => {
          const redirectUrl = this.route.snapshot.queryParamMap.get('redirect');
          this.router.navigateByUrl(redirectUrl || '/töölaud', { replaceUrl: !!(redirectUrl) });
        },
      });
  }

  /**
   * Gets ehis token
   * Used to refresh users token
   * @param token - JWT token
   */
  public getEhisToken(token) {
    this.http
      .post(`${this.settings.ehisUrl}/users/v1/haridusportaal/jwt`, { jwt: token })
      .pipe(take(1))
      .subscribe((res: any) => {
        if (res.jwt) {
          sessionStorage.setItem('ehisToken', res.jwt);
          this.saveEhisTokenInCookie(res.jwt);
          this.hasEhisToken.next(true);
        }
      });
  }

  public getAnonToken() {
    this.http.get(`${this.settings.ehisUrl}/users/v1/anonymous/jwt`, {responseType: 'text'}).subscribe((res: string) => {
      sessionStorage.setItem('ehisToken', res);
    })
  }

  /**
   * Sets ehis token in cookies
   * @param token - JWT token
   */
  public saveEhisTokenInCookie(token) {
    this.cookie.set('ehisToken', token, 0);
  }

  /**
   * Deletes ehis token from cookies
   */
  public deleteEhisTokenFromCookie() {
    this.cookie.remove('ehisToken');
  }

  /**
   * Logs user out of the page and navigates the user to homepage
   */
  public logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('redirectUrl');
    sessionStorage.removeItem('ehisToken');
    this.deleteEhisTokenFromCookie();

    this.isAuthenticated.next(false);
    this.hasEhisToken.next(false);
    this.router.navigateByUrl('/');
  }

  /**
   * Determines whether the user is logged in
   * @returns boolean
   */
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
      this.deleteEhisTokenFromCookie();

      if (this.isAuthenticated.getValue()) {
        this.isAuthenticated.next(false);
        this.hasEhisToken.next(false);
      }
      return false;
    }
    this.refreshUser();
    return true;
  }

  /**
   * Refreshs user
   * Updates users storage
   * @param [newToken] - JWT token
   */
  public refreshUser(newToken: any = false) {
    if (newToken) {
      sessionStorage.setItem('token', newToken);
      this.getEhisToken(newToken);
    }
    const token = sessionStorage.getItem('token');
    if (sessionStorage.getItem('ehisToken')) {
      this.hasEhisToken.next(true);
    }
    this.userData = this.decodeToken(token);
    /*if (!this.isAuthenticated.getValue()) {
      this.isAuthenticated.next(true);
    }*/
  }

  /**
   * Decodes token
   * @param token - JWT token
   * @returns - decoded token
   */
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

  /**
   * JWT expiration
   * @returns Time when the token expires
   */
  public expireTime() {
    const token = sessionStorage.getItem('token');
    const tokenPayload = token ? this.decodeToken(token) : {};
    if (tokenPayload.exp) {
      return tokenPayload.exp * 1000;
    }
    return false;
  }

  /**
   * Auth guard
   * @returns activate
   */
  public canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/auth'], {
        queryParams: { redirect: decodeURIComponent(state.url) },
      });
    } else {
      if (!sessionStorage.getItem('ehisToken')) {
        this.getEhisToken(sessionStorage.getItem('token'));
      }
    }
    return true;
  }

  private isTokenExpired() {
    const token = sessionStorage.getItem('token');
    const tokenPayload = this.decodeToken(token);

    return Date.now() >= tokenPayload.exp * 1000;
  }
}
