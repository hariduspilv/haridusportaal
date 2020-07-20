import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '@app/_services/userService';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { RootScopeService } from '@app/_services/rootScopeService';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TableModal } from '@app/_components/dialogs/table.modal/table.modal';
import { CheckModal } from '@app/_components/dialogs/check.modal/check.modal';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})

export class DashboardComponent implements OnInit, OnDestroy {
  public lang: string;
  public path: string;
  public currentRole = '';

  public subscriptions: Subscription[] = [];

  public mainMenu = {
    et: [
      {_id: 1, link: '/töölaud/taotlused', active: true },
      {_id: 2, link: '/töölaud/tunnistused', active: true },
      {_id: 3, link: '/töölaud/õpingud', active: true },
      {_id: 4, link: '/töölaud/õpetan', active: true }
    ],
  };

  public mainMenuCommonAttrs = {
    1: {icon: 'description', label: 'frontpage.dashboard_tabs_applications'},
    2: {icon: 'class', label: 'frontpage.dashboard_tabs_certificates'},
    3: {icon: 'local_library', label: 'frontpage.dashboard_tabs_studies'},
    4: {icon: 'school', label: 'frontpage.dashboard_tabs_teachings'}
  };
  public userData: any = {};

  constructor(
    private rootScope: RootScopeService,
    private router: Router,
    private route: ActivatedRoute,
    private user: UserService,
    public dialog: MatDialog,
    public translate: TranslateService
  ) {

  }
  pathWatcher() {
    const parameters = this.route.params.subscribe(
      (params: ActivatedRoute) => {
          this.path = this.router.url.split('?')[0];
          this.setPaths();
      }
    );
    const endpoint = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.path = this.router.url.split('?')[0];
        this.setPaths();
      }
    });
    this.subscriptions = [...this.subscriptions, parameters, endpoint];
  }
  setPaths() {
    const selectedLink = this.mainMenu[this.lang].find(item => item.link === this.path);
    const unselectedLangs: string[] = Object.keys(this.mainMenu).filter(language => language !== this.lang);

    const opts = {};

    opts[this.lang] = this.path;

    unselectedLangs.forEach(language => {
      opts[language] = this.mainMenu[language].find(counterpartLink => counterpartLink._id === selectedLink._id).link;
    });

    this.rootScope.set('langOptions', opts);
  }
  ngOnInit() {
    this.lang = this.rootScope.get('lang');
    this.rootScope.set('roleChanged', false);
    this.userData = this.user.getData();
    this.currentRole = this.userData['role']['current_role']['type'];
    this.pathWatcher();
    if (this.userData.isExpired === true) {
      this.router.navigateByUrl('');
    } else {
      this.roleStateSet();
      this.dialog.afterAllClosed.subscribe(result => {
        if (this.rootScope.get('roleChanged')) {
          this.rootScope.set('roleChanged', false);
          const paths = { 'et': '/töölaud/taotlused' };
          this.router.navigateByUrl(this.lang, {skipLocationChange: true}).then( () => {
            this.router.navigateByUrl(paths[this.lang]);
          });
        }
      });
    }
  }
  ngOnDestroy() {
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }

  dataModal() {
    const dialogRef = this.dialog;
    const data = {
      title: this.userData.username,
      pretitle: this.translate.get('frontpage.dashboard_tabs_personal_label')['value'],
      close: this.translate.get('frontpage.favourites_limit_modal_close')['value'],
      fieldsTranslationSrc: 'frontpage',
      fields: ['isikukood', 'synniKp', 'elukohamaa', 'rrElukoht', 'kodakondsus', 'elamisluba', 'oppelaenOigus'],
      contentUrl: '/dashboard/eeIsikukaart/personal_data?_format=json'
    };
    dialogRef.open(TableModal, {
      data: data
    });
  }
  changeRole() {
    const dialogRef = this.dialog;
    const data = {
      userData: this.userData,
      title: this.translate.get('modal.choose_role')['value'],
      pretitle: this.translate.get('modal.changing_role')['value'],
      cancel: this.translate.get('event.registration_form_cancel')['value'],
      confirm: this.translate.get('modal.confirm')['value'],
      contentUrl: '/custom/login/getRoles?_format=json'
    };
    dialogRef.open(CheckModal, {
      data: data
    });
  }

  roleStateSet() {
    this.mainMenu[this.lang].forEach(elem => {
      if (elem['_id'] > 1) {
        elem.active = !(this.currentRole === 'juridical_person');
      }
    });
  }
}
