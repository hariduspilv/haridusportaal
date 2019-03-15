import { Component } from '@angular/core';
import { RootScopeService, SideMenuService } from '@app/_services';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '@app/_services/settings.service';
import { UserService } from '@app/_services/userService';

@Component({
  selector: 'login-modal',
  templateUrl: 'login.modal.html',
  styleUrls: ['../modal/modal.scss', 'login.modal.scss']
})

export class LoginModal {
  loginVisible: boolean;
  postUrl:string;
  mobileUrl:string;
  formModels: object = {};
  data: any;

  mobileValidation: object = {
    challengeID: '',
    handshake: false,
    errorState: false,
    errorText: '',
  };
  error: boolean = false;

  user: any;

  loader:boolean;

  taraUrl: any;
  harIDurl: any;

  mobileIdLogin: boolean = false;
  basicLogin: boolean = false;

  authMethods = {
    basic: true,
    mobile_id: true,
    tara: true,
    harid: true,
  };

  constructor(
    private route : ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private http: HttpClient,
    private sidemenu: SideMenuService,
    private settings: SettingsService,
    private userService: UserService,
    private rootScope: RootScopeService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<LoginModal>,
  ){
    this.postUrl = this.settings.url+this.settings.login;
    this.mobileUrl = this.settings.url+this.settings.mobileLogin;
  }

  ngOnInit() {

    if( this.settings.url == "https://htm.wiseman.ee" || this.settings.url == "http://test-htm.wiseman.ee:30000" ){
      this.basicLogin = true;
      this.mobileIdLogin = true;
    }
    if( this.settings.url == "https://apitest.hp.edu.ee" ){
      this.mobileIdLogin = true;
    }
    this.http.get(`${this.settings.url}/auth_methods?_format=json`).subscribe((response) => {
      this.authMethods = Object.assign({}, this.authMethods, {...response['auth_methods']});
    })
  }

  submit(type) {
    /* clear all values */
    this.error = false;
    this.mobileValidation['errorState'] = false;
    this.mobileValidation['errorText'] = '';
    this.mobileValidation['challengeID'] = '';
    this.mobileValidation['handshake'] = false;
    this.loader = true;
    this.user = false;
    this.userService.clearStorage();
    this.user = this.userService.getData();
    this.formModels['password'] = !this.formModels['password'] ? '' : this.formModels['password'];
    this.formModels['auth_method'] = type === 'mobile' ? 'mobile_id' : 'basic';
    
    let headers = new HttpHeaders();
    headers = headers.append('X-CSRF-TOKEN', sessionStorage.getItem('xcsrfToken'));

    if (type === 'mobile') {
      let mobileForm = {telno: this.formModels['tel']};
      this.http.post(this.mobileUrl, mobileForm, {headers}).subscribe(data => {
        let consecutiveForm = { session_code: data['Sesscode'], id_code: data['UserIDCode'], auth_method: 'mobile_id' }
        this.mobileValidation['challengeID'] = data['ChallengeID'];
        this.loginSubmit(consecutiveForm, headers, true)
      }, (data) => {
        this.loader = false;
        if( !data['token'] ) {
          this.mobileValidation['errorState'] = true;
          this.mobileValidation['errorText'] = data['error'] && data['error']['message'] ? data['error']['message'] : 'errors.request';
          return false; 
        }
      });
    } else {
      this.loginSubmit(this.formModels, headers, false)
    }
  }

  loginSubmit (form: any, headers: any, isMobile: boolean) {
    if (isMobile) {
      this.loader = false;
      this.mobileValidation['handshake'] = true;
    }
    this.http.post(this.postUrl, form, {headers}).subscribe(data => {
      this.mobileValidation['handshake'] = false;
      this.mobileValidation['challengeID'] = '';
      this.loader = false;
      this.data = data;
      
      if( !data['token'] ) { 
        if (isMobile) { 
          this.mobileValidation['errorState'] = true; 
          this.mobileValidation['errorText'] = data['error'] && data['error']['message'] ? data['error']['message'] : 'errors.request';
        }
        if (!isMobile) this.error = true; 
        return false; 
      }

      for( let i in this.formModels ){
        this.formModels[i] = '';
      };

      this.loginVisible = false;

      this.user = this.userService.storeData(data['token']);
      
      let redirectUrl = '/töölaud/tunnistused';
      let lang = this.rootScope.get("lang");
      
      this.router.navigateByUrl("/", {skipLocationChange: true}).then( () => {
        this.router.navigateByUrl(redirectUrl);
        this.sidemenu.triggerLang();
      });
      this.userService.toggleLoggedInStatus(true);
      this.dialogRef.close();
      
    }, (data) => {
      this.formModels['password'] = '';
      this.loader = false;
      this.mobileValidation['handshake'] = false;
      if( !data['token'] ){
        if (isMobile) { 
          this.mobileValidation['errorState'] = true; 
          this.mobileValidation['errorText'] = data['error'] && data['error']['message'] ? data['error']['message'] : 'errors.request';
        }
        if (!isMobile) this.error = true;
        return false; 
      }
    });
  }

  openTara() {
    this.taraUrl = this.settings.url+"/external-login/tara";
    window.location.href = this.taraUrl;
  }

  openHarID() {
    this.harIDurl = this.settings.url+"/external-login/harid";
    window.location.href = this.harIDurl;
  }

  closeModal() {
    this.dialogRef.close();
  }
  
}
