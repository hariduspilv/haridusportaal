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
  ViewRef,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService, AlertsService, ModalService, AuthService } from '@app/_services';
import * as _moment from 'moment';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApplicationsComponent } from '@app/_assets/applications/applications.component';
import { ActivatedRoute, Router, NavigationEnd, NavigationStart } from '@angular/router';
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
  pageLoading: boolean = false;

  sidebar = {
    entity: {
      favourites: [],
      event: [],
      gdpr: true,
    },
  };
  eventsListDone = false;
  favouritesListDone = false;
  public breadcrumbs: any;
  public formGroup: FormGroup = this.formBuilder.group({
    roleSelection: [''],
  });
  public routerSub: Subscription = new Subscription();
  public subscriptions: Subscription[];

  private modalSubscription: Subscription = new Subscription();
  private roleSubscription: Subscription = new Subscription();
  private setRoleSubscription: Subscription = new Subscription();
  private getFavouritesSubscription: Subscription = new Subscription();
  private eventListSubscription: Subscription = new Subscription();

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
    public route: ActivatedRoute,
    public translate: TranslateService,
  ) {}

  pathWatcher() {
    this.routerSub = this.router.events.subscribe((event: any) => {

      if (event instanceof NavigationEnd) {
        this.breadcrumbs = decodeURI(event.url);
        try {

          let partial = this.breadcrumbs.split('/')[2] || 'intro';
          if (this.currentRole === 'juridical_person' && partial === 'intro') {
            partial = 'taotlused';
          }
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

        this.detectChanges();
      }
    });
  }

  redirectTo(uri:string){
    this.router.navigateByUrl('/dummy', { skipLocationChange: true }).then(() =>
    this.router.navigate([uri]));
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

    this.detectChanges();
  }

  loadUserModal() {
    this.error = false;
    this.loading = true;
    this.modalService.toggle('userModal');
    this.modalSubscription = this.http
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
        this.modalSubscription.unsubscribe();
      });
  }

  initUser() {
    this.currentRole = this.userData.role.current_role.type;
    this.codeSelection = this.currentRole === 'juridical_person' ?
    this.userData.role.current_role.data.reg_kood : this.userData.username;
    this.formGroup.controls.roleSelection.setValue(this.currentRole);
    this.pageLoading = false;
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
    this.roleSubscription = this.http
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
          this.roleSubscription.unsubscribe();
        });
  }

  setRole() {
    const data = {
      type: this.roleSelection,
      id: this.codeSelection,
    };
    this.pageLoading = true;
    this.setRoleSubscription = this.http
      .post(`${this.settings.url}/custom/login/setRole`, data)
      .subscribe(
        (response: any) => {
          if (response['token']) {
            this.auth.refreshUser(response['token']);
            //this.router.navigateByUrl('/töölaud/taotlused');
          }
          this.setRoleSubscription.unsubscribe();
          this.modalService.close('roleModal');
          this.initUser();
          this.pageLoading = false;
          this.redirectTo('/töölaud');
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

  detectChanges() {
    if (this.cdr && !(this.cdr as ViewRef).destroyed) {
      this.cdr.detectChanges();
    }
  }
  getFavouritesList(): void {
    const variables = {
      language: 'ET',
      id: this.userData.drupal.uid,
    };

    const path = this.settings.query('customFavorites', variables);

    this.getFavouritesSubscription = this.http.get(path)
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

          this.getFavouritesSubscription.unsubscribe();
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

    this.eventListSubscription = this.http.get(path)
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
      this.eventListSubscription.unsubscribe();
      this.eventsListDone = true;
    });
  }

  bindIntroLinks(): void {
    if (this.intro){
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
  }

  getNotifications(): void {
    const notifications = {
      unread: 0,
      list: [],
    };
    if (this.auth.hasEhisToken.getValue()) {
      this.http.get(`${this.settings.ehisUrl}/messages/messages/receiver/unreadmessagecount`).subscribe((val: any) => {
        notifications.unread = val.UnreadMessagesQty;
      });
      this.http.get(`${this.settings.ehisUrl}/messages/messages/receiver?orderby=sentAt&sort=DESC`).subscribe((val: any) => {
        if (val.messages.length > 5) {
          notifications.list = [...val.messages.splice(0, 5)];
        } else {
          notifications.list = [...val.messages];
        }
      });
    }
    this.sidebar.entity['notifications'] = notifications;
  }

  ngOnInit() {
    this.initialize();
    this.pathWatcher();
  }


  ngAfterViewInit() {
    this.bindIntroLinks();
  }
  ngOnDestroy() {
    // this.cdr.detach();
    this.routerSub.unsubscribe();
    this.modalSubscription.unsubscribe();
    this.roleSubscription.unsubscribe();
    this.setRoleSubscription.unsubscribe();
    this.getFavouritesSubscription.unsubscribe();
    this.eventListSubscription.unsubscribe();

  }
}
