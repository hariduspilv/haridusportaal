import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { SideMenuService } from '@app/_services';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError, ActivatedRoute, RoutesRecognized } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

import { SettingsService } from '@app/_core/settings';
import { UserService } from '@app/_services/userService';

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
    private settings: SettingsService,
    private userService: UserService
  ) {
    this.postUrl = this.settings.url+this.settings.login;
  }

  toggleLogin() {
    this.loginVisible = !this.loginVisible;
  }

  submit() {

    /* clear all values */
    this.error = false;
    this.loader = true;
    this.user = false;
    this.userService.clearStorage();
    this.formModels['password'] = !this.formModels['password'] ? '' : this.formModels['password']
    this.http.post(this.postUrl, this.formModels).subscribe(data => {
      this.formModels['password'] = '';
      this.loader = false;
      this.data = data;

      if( !data['token'] ){ this.error = true; return false; }

      for( let i in this.formModels ){
        this.formModels[i] = '';
      };

      this.loginVisible = false;

      this.user = this.userService.storeData(data['token']);
      //this.userService.triggerPageReload();  
      switch(this.router.url.split('/')[1]){
        case 'et': this.router.navigateByUrl('/et/toolaud'); break;
        case 'en': this.router.navigateByUrl('/en/dashboard'); break;
      }
    });

  }
  ngOnInit() {
    this.user = this.userService.getData();
  }

  logOut() {
    this.userService.logout();
    this.user = this.userService.getData();
    
  }

  /*
  submit() {

    this.error = false;

    this.loader = true;

    this.userService.clearStorage();

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

        this.userService.triggerPageReload();
  
        this.loginVisible = false;

        this.userService.decodeToken();
      }else{
        this.error = true;
      }
      
    });
  }

  logOut() {
    this.userService.logout();
  }

  readStorage() {
    return localStorage.getItem("token");
  }

  ngOnInit() {
    this.userService.decodeToken();
  }

  */
}
