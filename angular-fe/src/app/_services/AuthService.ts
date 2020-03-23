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
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements CanActivate {
  plumbr = (<any>window).PLUMBR;

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
          this.userData = this.decodeToken(response.token);
          this.setPlumbrId();
          this.testNewJWT(response['token']);
        } else {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('ehisToken');
          sessionStorage.removeItem('redirectUrl');
        }
        return response;
      }));
  }

  private setPlumbrId() {
    if (this.plumbr) {
      this.plumbr.setUserId(this.userData.drupal.uid);
    }
  }

  public testNewJWT(token) {
    const data = {
      jwt: token,
    };
    this.http
    .post(`${this.settings.ehisUrl}/users/v1/haridusportaal/jwt`, data).subscribe(
      (response: any) => {
        if (response.jwt) {
          sessionStorage.setItem('ehisToken', response.jwt);
          this.hasEhisToken.next(true);
          this.isAuthenticated.next(true);
        }
        const redirectUrl = this.route.snapshot.queryParamMap.get('redirect') || sessionStorage.getItem('redirectUrl');
        this.router.navigateByUrl(redirectUrl || '/töölaud', { replaceUrl: !!(redirectUrl) });
      },
      (err) => {
        const redirectUrl = this.route.snapshot.queryParamMap.get('redirect');
        this.router.navigateByUrl(redirectUrl || '/töölaud', { replaceUrl: !!(redirectUrl) });
      }
    );
  }

  // this just used for the refreshuser part
  public getEhisToken(token) {
    this.http
    .post(`${this.settings.ehisUrl}/users/v1/haridusportaal/jwt`, { jwt: token })
    .pipe(take(1))
    .subscribe((res: any) => {
      if (res.jwt) {
        sessionStorage.setItem('ehisToken', res.jwt);
      }
    });
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
    /*if (!this.isAuthenticated.getValue()) {
      this.isAuthenticated.next(true);
    }*/
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
    } else {
      if (!sessionStorage.getItem('ehisToken')) {
        this.getEhisToken(sessionStorage.getItem('token'));
      }
    }
    return true;
  }
}
