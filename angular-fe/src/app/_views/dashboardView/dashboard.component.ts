import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  OnDestroy,
  ContentChildren,
  forwardRef,
  QueryList,
  ViewChildren,
  AfterViewInit,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService, AlertsService, ModalService, AuthService } from '@app/_services';
import * as _moment from 'moment';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApplicationsComponent } from '@app/_assets/applications/applications.component';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { NavigationEvent } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker-view-model';
import { BlockComponent, BlockContentComponent } from '@app/_assets/block';
import { Subscription } from 'rxjs';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { ThrowStmt } from '@angular/compiler';
const moment = _moment;
@Component({
  selector: 'dashboard-view',
  templateUrl: 'dashboard.template.html',
  styleUrls: ['dashboard.styles.scss'],
})

export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(ApplicationsComponent, { static: false }) applicationsComponent: ApplicationsComponent;
  @ViewChild('intro', { static: false }) intro;
  @ViewChild(BlockComponent, { static: false }) blockComponent: BlockComponent;
  @ViewChildren(forwardRef(() => BlockContentComponent))
  blockContents: QueryList<BlockContentComponent>;

  linksLabel = 'links';
  titleExists = true;
  topAction = true;
  bottomAction = true;
  roleBottomAction = false;
  loading = false;
  userData: any;
  error = false;
  personalData: any;
  roleData: any;
  personalDataFields = [
    'isikukood', 'synniKp', 'elukohamaa', 'rrElukoht', 'kodakondsus', 'elamisluba',
  ];
  currentRole: any;
  roleSelection: any;
  codeSelection: any;
  initialRole: any;
  roleNaturalOptions: any;
  roleJuridicalOptions: [];
  sidebar = {
    entity: {
      favourites: [],
      event: [],
      // notifications: {},
    },
  };
  eventsListDone = false;
  favouritesListDone = false;
  public breadcrumbs: any;
  public formGroup: FormGroup = this.formBuilder.group({
    roleSelection: [''],
  });
  public routerSub: Subscription = new Subscription();
  constructor(
    private modalService: ModalService,
    private http: HttpClient,
    private settings: SettingsService,
    private alertsService: AlertsService,

    public auth: AuthService,
    public location: Location,
    public formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef,
    public router: Router,
    public translate: TranslateService,
  ) {}

  pathWatcher() {
    this.routerSub = this.router.events.subscribe((event: any) => {

      if (event instanceof NavigationEnd) {
        this.breadcrumbs = decodeURI(event.url);
        try {

          const partial = this.breadcrumbs.split('/')[2] || '';

          console.log(partial);
          let activeTab;
          this.blockContents.forEach((item) => {
            if (item.tabLink === partial) {
              activeTab = item;
            }
          });

          this.blockComponent.selectTab(activeTab);
        } catch (err) {
          console.log(err);
        }

        this.cdr.detectChanges();
      }
    });
  }

  initialize() {
    this.userData = this.auth.userData;
    this.breadcrumbs = decodeURI(this.location.path());
    this.initUser();
    this.getFavouritesList();
    this.getEventList();
    this.getNotifications();

    if (this.blockComponent) {
      this.blockComponent.selectTab(
        this.blockComponent.tabs.find(
          (tab: any) => {
            return tab.tabLabel === 'Taotlused';
          },
        ),
      );

    }

    if (this.applicationsComponent) {
      setTimeout(
        () => {
          this.applicationsComponent.initialize();
        },
        300);
    }

    this.cdr.detectChanges();
  }

  loadUserModal() {
    this.error = false;
    this.loading = true;
    this.modalService.toggle('userModal');
    const sub = this.http
      .get(
        `${this.settings.url}/dashboard/eeIsikukaart/personal_data?_format=json`,
      )
      .subscribe((response: any) => {
        if (response.error) {
          this.alertsService.error(
            response['error']['message_text']['et'],
            'personalData', 'personalData', false, false,
          );
          this.error = true;
        } else {
          this.personalData = response.value.isikuandmed;
        }
        this.loading = false;
        sub.unsubscribe();
      });
  }

  initUser() {
    this.currentRole = this.userData.role.current_role.type;
    this.codeSelection = this.currentRole === 'juridical_person' ?
    this.userData.role.current_role.data.reg_kood : this.userData.username;
    this.formGroup.controls.roleSelection.setValue(this.currentRole);
  }

  loadRoleChangeModal() {
    this.error = false;
    this.loading = true;
    this.modalService.toggle('roleModal');
    this.codeSelection =
      this.userData.role.current_role.data ? this.userData.role.current_role.data.reg_kood : null;
    this.roleSelection = this.userData.role.current_role.type;
    if (this.roleSelection === 'juridical_person') {
      this.formGroup.controls.roleSelection.setValue(`juridical-${this.codeSelection}`);
    }
    this.initialRole = this.roleSelection;
    const sub = this.http
      .get(
        `${this.settings.url}/custom/login/getRoles?_format=json`,
      )
      .subscribe(
        (response: any) => {
          if (response.error) {
            this.alertsService
              .error(response['error']['message_text']['et'], 'roles', 'roles', false, false);
            this.error = true;
          } else {
            this.initialRole = this.roleSelection;
            this.roleJuridicalOptions = response.value.ettevotted;
            this.roleNaturalOptions = [
              {
                key: this.userData.username,
                value: 'natural_person',
              },
            ];
          }
          this.loading = false;
          sub.unsubscribe();
        });
  }

  setRole() {
    const data = {
      type: this.roleSelection,
      id: this.codeSelection,
    };
    const sub = this.http
      .post(`${this.settings.url}/custom/login/setRole`, data)
      .subscribe(
        (response: any) => {
          if (response['token']) {
            this.auth.refreshUser(response['token']);
            this.router.navigateByUrl('/töölaud/taotlused');
            this.initialize();
          }
          sub.unsubscribe();
          this.modalService.close('roleModal');
        },
        (err) => {
          if (err['message'] || err['error']['message']) {
            this.error = true;
            this.alertsService
              .error(err['error']['message'] || err['message'], 'roles', 'roles', false, false);
          }
        });
  }

  roleChange() {
    if (this.initialRole !== this.formGroup.value.roleSelection) {
      if (this.formGroup.value.roleSelection.includes('-')) {
        this.roleSelection = this.formGroup.value.roleSelection.split('-')[0];
      }
      this.setRole();
    } else {
      this.closeRoleChangeModal();
    }
  }

  closeRoleChangeModal() {
    this.modalService.close('roleModal');
  }

  getFavouritesList(): void {
    const variables = {
      language: 'ET',
      id: this.userData.drupal.uid,
    };

    const path = this.settings.query('customFavorites', variables);

    const subscription = this.http.get(path)
      .subscribe(
        (response) => {
          if (
            response['data']['CustomFavorites'] &&
            response['data']['CustomFavorites']['favoritesNew'].length
          ) {
            this.sidebar.entity.favourites =
              response['data']['CustomFavorites']['favoritesNew']
                .filter(item => item.entity != null).map((item) => {
                  return {
                    title: item.entity.entityLabel,
                    url: {
                      path: item.entity.entityUrl.path,
                      routed: true,
                    },
                  };
                });
          } else {
            const label = this.translate.get('frontpage.favourites_list_none_message');
            this.sidebar.entity.favourites = [label];
          }

          subscription.unsubscribe();
          this.favouritesListDone = true;
        });
  }

  getEventList(): void {
    const variables = {
      tagsEnabled: false,
      typesEnabled: false,
      titleEnabled: false,
      dateFrom: moment().format('YYYY-MM-DD'),
      dateTo: moment().add(20, 'years').format('YYYY-MM-DD'),
      offset: 0,
      limit: 3,
      lang: 'ET',
      timeFrom: '0',
      timeTo: '99999999',
    };

    const path = this.settings.query('getEventList', variables);

    const subscription = this.http.get(path)
    .subscribe((response: any) => {
      const data = response.data.nodeQuery.entities;
      if (data && data.length) {
        this.sidebar.entity.event = data.sort((a, b) => {
          if (
            moment(a.fieldEventMainDate.unix * 1000)
              .format('YYYY-MM-DD') ===
            moment(b.fieldEventMainDate.unix * 1000)
              .format('YYYY-MM-DD')
          ) {
            return a.fieldEventMainStartTime - b.fieldEventMainStartTime;
          }
          return 0;
        });
      } else {
        this.sidebar.entity.event = [];
      }
      subscription.unsubscribe();
      this.eventsListDone = true;
    });
  }

  bindIntroLinks(): void {
    this.intro.nativeElement.querySelectorAll('a').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const href = item.attributes.href.value;
        if (href.indexOf('modal-') !== -1) {
          const modal = href.split('modal-')[1];
          if (modal === 'roleModal') {
            this.loadRoleChangeModal();
          } else {
            this.modalService.open(modal);
          }
        } else {
          this.router.navigateByUrl(href);
        }
      });
    });
  }

  getNotifications(): void {
    // make request
    const unreadNotifications = 10;
    const notificationsList = [
      {
        koer: 'Õppetoetuse taotluse rahuldamise otsus',
        timestamp: 15939323,
        date: 135352342,
        unread: true,
      },
      {
        koer: 'Eksmatrikuleerimine eluülikoolist igaveseks',
        timestamp: 15939323,
        date: 135352342,
        unread: true,
      },
      {
        koer: 'Õpikute tagastamise reeglid',
        timestamp: 15939323,
        date: 135352342,
        unread: false,
      },
      {
        koer: 'kala',
        timestamp: 15939323,
        date: 135352342,
        unread: false,
      },
      {
        koer: 'kala',
        timestamp: 15939323,
        date: 135352342,
        unread: false,
      },
      {
        koer: 'kala',
        timestamp: 15939323,
        date: 135352342,
        unread: true,
      },
      {
        koer: 'kala',
        timestamp: 15939323,
        date: 135352342,
        unread: true,
      },
    ]
    // this.sidebar.entity['notifications']['list'] = notificationsList;
    // this.sidebar.entity['notifications']['unread'] = unreadNotifications;
    // request done
    // give data to sidebar
  }

  ngOnInit() {
    this.initialize();
  }


  ngAfterViewInit() {
    this.bindIntroLinks();
    this.pathWatcher();
  }
  ngOnDestroy() {
    this.cdr.detach();
    this.routerSub.unsubscribe();
  }
}
