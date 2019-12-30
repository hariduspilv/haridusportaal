import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RootScopeService, SideMenuService } from '@app/_services';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { LoginModal } from '@app/_components/dialogs/login.modal/login.modal';

@Component({
  templateUrl: './notfound.component.html',
  styleUrls: ['./notfound.component.scss']
})

export class NotFoundComponent implements AfterViewInit {

  public viewTranslations: any;
  public translatedLinks: object = {
    school: {et: '/kool'},
    events: {et: '/sündmused'},
    news: {et: '/uudised'}
  };
  public redirectUrl: string;

  constructor(
    private dialog: MatDialog,
    private rootScope: RootScopeService,
    private sidemenu: SideMenuService,
    private route: ActivatedRoute,
    private router: Router) {
      this.redirectUrl = this.route.snapshot.queryParamMap.get('redirect');
  }

  ngAfterViewInit() {
    this.sidemenu.triggerLang(true);
    if (this.redirectUrl) {
      this.openLogin();
    } else {
      document.getElementById('toFront').focus();
    }
  }

  constructUrl(type) {
    return this.translatedLinks[type][this.rootScope.get('lang')];
  }

  openLogin() {
    this.dialog.closeAll();
    const dialogRef = this.dialog.open(LoginModal, {
      panelClass: 'sticky-dialog-container',
      backdropClass: 'sticky-dialog-backdrop'
    });
    if (dialogRef['_overlayRef'].overlayElement) {
      dialogRef['_overlayRef'].overlayElement.parentElement.className += ' sticky-dialog-wrapper';
    }
  }

  action() {
    if (this.redirectUrl) {
      sessionStorage.setItem('redirectUrl', this.redirectUrl);
      this.openLogin();
    } else {
      this.router.navigate(['/']);
    }
  }
}
