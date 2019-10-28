import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivate,
} from '@angular/router';
import { Observable } from 'rxjs';
import { SettingsService } from './SettingsService';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnInit, CanActivate {
  constructor(
    private http: HttpClient,
    private router: Router,
    private settings: SettingsService,
  ) {}

  public login(data) {
    return this.http
    .post(`${this.settings.url}/api/v1/token?_format=json`, data)
    .pipe(map((response) => {
      if (response['token']) {
        sessionStorage.setItem('token', response['token']);
      } else {
        sessionStorage.removeItem('token');
      }
      return response;
    }));
  }

  private checkLogin() {
    return true;
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.checkLogin()) {
      return true;
    }
    this.router.navigateByUrl('/');
    return false;
  }

  ngOnInit() {
    this.checkLogin();
  }

}
