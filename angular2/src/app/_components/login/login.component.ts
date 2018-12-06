import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { SideMenuService, RootScopeService } from '@app/_services';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError, ActivatedRoute, RoutesRecognized } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SettingsService } from '@app/_core/settings';
import { UserService } from '@app/_services/userService';
import { taraLoginModal } from '../dialogs/taraLogin/taraLogin.modal';

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

  taraUrl: any;

  basicLogin: boolean = false;

  constructor(
    private route : ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private http: HttpClient,
    private sidemenu: SideMenuService,
    private settings: SettingsService,
    private userService: UserService,
    private rootScope: RootScopeService,
    public dialog: MatDialog
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
    this.formModels['password'] = !this.formModels['password'] ? '' : this.formModels['password'];
    this.formModels['auth_method'] = 'basic';
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
      
      let redirectUrl;
      let lang = this.router.url.split('/')[1];
      switch(lang){
        case 'et': redirectUrl = '/et/toolaud/taotlused';
        case 'en': redirectUrl = '/en/dashboard/certificates';
        default: redirectUrl = '/et/toolaud/taotlused';
      }
      
      this.router.navigateByUrl(lang, {skipLocationChange: true}).then( () => {
        this.router.navigateByUrl(redirectUrl);
        this.sidemenu.triggerLang(true);
      });
    
    
      
    }, (data) => {
      this.formModels['password'] = '';
      this.loader = false;
      if( !data['token'] ){ this.error = true; return false; }
    });

  }
  openTara() {
    this.taraUrl = /*this.settings.url+*/"https://htm.wiseman.ee/tara-login";

    window.location = this.taraUrl;
    /*
    this.loginVisible = false;
    
    this.dialog.open(taraLoginModal, {
      data: this.taraUrl
    });*/
    
  }
  ngOnInit() {

    if( this.settings.url == "https://htm.wiseman.ee/" ){
      this.basicLogin = true;
    }
    
    this.user = this.userService.getData();
  }

  logOut() {
    this.userService.logout();
    this.user = this.userService.getData();
    this.rootScope.set('teachingsAccordion', 0);
    this.rootScope.set('certificatesAccordion', 0);
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
