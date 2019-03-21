import { Component, OnInit } from '@angular/core';
import { SideMenuService, RootScopeService } from '@app/_services';
import { MatDialog } from '@angular/material';
import { SettingsService } from '@app/_services/settings.service';
import { UserService } from '@app/_services/userService';
import { LoginModal } from '../dialogs/login.modal/login.modal';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent {
  constructor(
    private sidemenu: SideMenuService,
    private settings: SettingsService,
    private userService: UserService,
    private rootScope: RootScopeService,
    public dialog: MatDialog
  ) {

  }

  get isLoggedIn(): boolean {
    return this.userService.isLoggedIn;
  }

  get user(): any {
    return this.userService.getData();
  }

  toggleLogin() {
    this.dialog.open(LoginModal, {
      
    });
  }

  logOut() {
    this.userService.logout();
    this.rootScope.set('teachingsAccordion', 0);
    this.rootScope.set('certificatesAccordion', 0);
    this.sidemenu.triggerLang();
  }
}
