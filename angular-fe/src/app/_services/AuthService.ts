import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivate,
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
          localStorage.setItem('token', response['token']);
          this.isAuthenticated.next(true);
          this.userData = this.decodeToken(response.token);
          this.router.navigateByUrl('/töölaud');
        } else {
          localStorage.removeItem('token');
        }
        return response;
      }));
  }

  public logout() {
    localStorage.removeItem('token');
    this.isAuthenticated.next(false);
    this.router.navigateByUrl('/');
  }

  public isLoggedIn() {
    if (!localStorage.getItem('token')) {
      return false;
    }
    if (this.isTokenExpired()) {
      localStorage.removeItem('token');
      return false;
    }
    this.refreshUser();
    return true;
  }

  public refreshUser(newToken:any = false) {
    if (newToken) {
      localStorage.setItem('token', newToken);
    }
    const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
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
      this.isAuthenticated.next(false);
      this.router.navigateByUrl('/');
    }
    return true;
  }
  // does nothing, services dont Init;
  // ngOnInit() {
  //   this.isLoggedIn();
  // }
}
