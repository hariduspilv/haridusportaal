import { Injectable } from '@angular/core';
import { SideMenuService } from '@app/_services/sidemenuService';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class UserService{

  private tokenKey: string = "token";

  constructor(
    private router: Router,
    private sidemenu: SideMenuService
  ) {
    
  }

  private decodeToken(inputToken:any = "") {
    
    const token = inputToken ? inputToken : this.getStorage();

    if( !token ){
      return {
        isExpired : true
      }
    }

    const helper = new JwtHelperService();

    const decodedToken = helper.decodeToken(token);
    const isExpired = helper.isTokenExpired(token);
    let data = {};

    if( !isExpired ){
      data = decodedToken;
    }else{
      this.clearStorage();
    }

    return data;

  }

  public triggerPageReload() {

    let url = {
      lang: this.router.url.split("/")[1],
      current: this.router.url
    }

    this.router.navigateByUrl(url.lang, {skipLocationChange: true}).then( () => {
      this.router.navigateByUrl(url.current);
      this.sidemenu.triggerLang(true);
    });
  }

  public logout() {
    localStorage.removeItem( this.tokenKey ); 
    this.triggerPageReload();
  }

  public clearStorage() {
    localStorage.removeItem( this.tokenKey );
  }

  private getStorage() {
    return localStorage.getItem( this.tokenKey );
  }

  private setStorage(token) {
    localStorage.setItem( this.tokenKey, token);
    
  }

  public storeData(token) {
    this.setStorage(token);
    return this.decodeToken( token );
  }
  
  public getData() {
    return this.decodeToken();
  }

  public checkStatus() {
    let data = this.decodeToken();
    if( data['isExpired'] ){
      this.triggerPageReload();
    }
  }

}