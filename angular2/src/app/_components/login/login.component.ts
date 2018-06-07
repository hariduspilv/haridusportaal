import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { SideMenuService } from '../../_services';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError, ActivatedRoute, RoutesRecognized } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit{
  
  loginVisible: boolean;
  postUrl:string = "http://test-htm.wiseman.ee:30000/et/api/v1/token?_format=json";
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
    private sidemenu: SideMenuService
  ) {}

  toggleLogin() {
    this.loginVisible = !this.loginVisible;
  }

  submit() {

    this.error = false;
    
    this.loader = true;

    this.http.post(this.postUrl, this.formModels).subscribe(data => {

      this.formModels['password'] = '';

      this.loader = false;

      this.data = data;

      localStorage.setItem("token", this.data.token);

      if( data['token'] ){

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
