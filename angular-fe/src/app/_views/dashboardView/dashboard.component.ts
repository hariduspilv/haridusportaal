import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService, AlertsService, ModalService, AuthService } from '@app/_services';
import * as _moment from 'moment';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApplicationsComponent } from '@app/_assets/applications/applications.component';
import { ActivatedRoute, Router } from '@angular/router';
import { NavigationEvent } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker-view-model';
import { BlockComponent } from '@app/_assets/block';
import { Subscription } from 'rxjs';
const moment = _moment;
@Component({
  selector: 'dashboard-view',
  templateUrl: 'dashboard.template.html',
  styleUrls: ['dashboard.styles.scss'],
})

export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild(ApplicationsComponent, { static: false }) applicationsComponent: ApplicationsComponent;
  @ViewChild(BlockComponent, { static: false }) blockComponent: BlockComponent;
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
  ) { }

  ngOnInit() {
    this.initialize();
    this.pathWatcher();
  }

  pathWatcher() {
    this.routerSub = this.router.events.subscribe((event: any) => {
      if (event.constructor.name === 'NavigationStart') {
        this.breadcrumbs = decodeURI(event.url);
        this.cdr.detectChanges();
      }
    });
  }

  initialize() {
    this.userData = this.auth.userData;
    this.breadcrumbs = decodeURI(this.location.path());
    this.currentRole = this.userData.role.current_role.type;
    this.formGroup.controls.roleSelection.setValue(this.currentRole);
    this.getFavouritesList();
    this.getEventList();
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
      this.applicationsComponent.initialize();
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
                .filter(item => item.entity != null);
          } else {
            this.sidebar.entity.favourites = [];
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
        console.log(data);
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
  ngOnDestroy() {
    this.cdr.detach();
    this.routerSub.unsubscribe();
  }
}
