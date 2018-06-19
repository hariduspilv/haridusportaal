import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { SideMenuService } from '../../_services';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError, ActivatedRoute, RoutesRecognized } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';

import { SettingsService } from '../../_core/settings';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit{
  
  loginVisible: boolean;
  postUrl:string;
  formModels: object = {};
  data: any;

  error: boolean = false;

  user: any;

  loader:boolean;

  constructor(
    private route : ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private http: HttpClient,
    private sidemenu: SideMenuService,
    private settings: SettingsService
  ) {
    this.postUrl = this.settings.url+this.settings.login;
  }

  toggleLogin() {
    this.loginVisible = !this.loginVisible;
  }

  submit() {

    this.error = false;

    this.loader = true;

    localStorage.removeItem("token");
    this.user = false;

    this.http.post(this.postUrl, this.formModels).subscribe(data => {

      this.formModels['password'] = '';

      this.loader = false;

      this.data = data;

      if( data['token'] ){

        localStorage.setItem("token", this.data.token);

        for( let i in this.formModels ){
          this.formModels[i] = '';
        };

        this.triggerPageReload();
  
        this.loginVisible = false;

        this.decodeToken();
      }else{
        this.error = true;
      }
      
    });
  }

  triggerPageReload() {

    let url = {
      lang: this.router.url.split("/")[1],
      current: this.router.url
    }

    this.router.navigateByUrl(url.lang, {skipLocationChange: true}).then( () => {
      this.router.navigateByUrl(url.current);
      this.sidemenu.triggerLang(true);
    });
  }

  logOut() {
    this.user = false;
    localStorage.removeItem("token");

    this.triggerPageReload();
  }

  readStorage() {
    return localStorage.getItem("token");
  }

  decodeToken() {

    const token = this.readStorage();

    if( !token ){
      this.user = false;
      return false;
    }

    const helper = new JwtHelperService();

    const decodedToken = helper.decodeToken(token);
    const isExpired = helper.isTokenExpired(token);

    if( isExpired ){
      this.user = false;
    }else{
      this.user = decodedToken;
    }

  }

  ngOnInit() {
    this.decodeToken();
  }

}
