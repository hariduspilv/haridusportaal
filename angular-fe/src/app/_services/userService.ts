import { Injectable } from '@angular/core';
import { SidemenuService } from '@app/_services/SidemenuService';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { RootScopeService } from './RootScopeService';
import { Subject } from 'rxjs';

@Injectable()
export class UserService{

  private tokenKey: string = 'token';
  public isLoggedIn: boolean = false;
  isLoggedInChange: Subject<boolean> = new Subject<boolean>();
  constructor(
    private router: Router,
    private sidemenu: SidemenuService,
  ) {
    this.isLoggedInChange.subscribe(value => {
      this.isLoggedIn = value;
    });
  }

  toggleLoggedInStatus(isLoggedIn: boolean) {
    this.isLoggedInChange.next(isLoggedIn);
  }

  public decodeToken(inputToken:any = '') {

    const token = inputToken ? inputToken : this.getStorage();

    if (!token) {
      return {
        isExpired : true,
      };
    }

    const helper = new JwtHelperService();

    const decodedToken = helper.decodeToken(token);
    const isExpired = helper.isTokenExpired(token);
    let data = {};

    if (!isExpired) {
      data = decodedToken;
      this.toggleLoggedInStatus(true);
    }else {
      this.clearStorage();
    }

    data['isExpired'] = isExpired;
    return data;

  }

  public triggerPageReload() {

    const url = {
      lang: 'et',
      current: this.router.url,
    };

    this.router.navigateByUrl(url.lang, { skipLocationChange: true }).then(() => {
      this.router.navigateByUrl(url.current);
      this.sidemenu.triggerLang(true);
    });
  }

  public logout() {
    sessionStorage.removeItem(this.tokenKey);
    this.toggleLoggedInStatus(false);
    if (decodeURIComponent(this.router.url).indexOf('/töölaud/') !== -1 || decodeURIComponent(this.router.url).indexOf('/dashboard/')  !== -1) {
      this.router.navigateByUrl('/');
    } else {
      this.triggerPageReload();
    }
  }

  public clearStorage() {
    this.toggleLoggedInStatus(false);
    sessionStorage.removeItem(this.tokenKey);
  }

  private getStorage() {
    return sessionStorage.getItem(this.tokenKey);
  }

  private setStorage(token) {
    sessionStorage.setItem(this.tokenKey, token);

  }

  public storeData(token) {
    this.setStorage(token);
    return this.decodeToken(token);
  }

  public getData() {
    return this.decodeToken();
  }

  public checkStatus() {
    const data = this.decodeToken();
    if (data['isExpired']) {
      this.triggerPageReload();
    }
  }

}
