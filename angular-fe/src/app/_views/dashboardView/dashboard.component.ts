import {
  Component,
  OnInit,
  Input,
} from '@angular/core';
import { UserService } from '@app/_services/userService';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { SettingsService, AlertsService, ModalService, AuthService } from '@app/_services';
import * as _moment from 'moment';
const moment = _moment;
@Component({
  selector: 'dashboard-view',
  templateUrl: 'dashboard.template.html',
  styleUrls: ['dashboard.styles.scss'],
})

export class DashboardComponent implements OnInit {
  @Input() breadcrumbs: Object[];
  @Input() jwt;

  linksLabel = 'links';
  titleExists = true;
  topAction = true;
  bottomAction = true;
  roleBottomAction = false;
  loading = false;
  userData: any;
  headers: HttpHeaders;
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
      events: [],
    },
  };

  constructor(
    private modalService: ModalService,
    private http: HttpClient,
    private settings: SettingsService,
    private alertsService: AlertsService,

    public auth: AuthService,
  ) { }

  ngOnInit() {
    this.userData = this.auth.userData;

    this.currentRole = this.userData.role.current_role.type;
    this.getFavouritesList();
    this.getEventList();
  }

  loadUserModal() {
    this.error = false;
    this.loading = true;
    this.modalService.toggle('userModal');
    const sub = this.http
      .get(
        `${this.settings.url}/dashboard/eeIsikukaart/personal_data?_format=json`,
        { headers: this.headers },
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
      this.roleSelection = `juridicial-${this.codeSelection}`;
    }
    this.initialRole = this.roleSelection;
    const sub = this.http
      .get(
        `${this.settings.url}/custom/login/getRoles?_format=json`,
        { headers: this.headers },
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
      .post(`${this.settings.url}/custom/login/setRole`, data, { headers: this.headers })
      .subscribe(
        (response: any) => {
          if (response['token']) {
            this.auth.userData = response['token'];
          }
          sub.unsubscribe();
          // this.rootScope.set('roleChanged', true);
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
    if (this.initialRole !== this.roleSelection) {
      if (this.roleSelection.includes('-')) {
        this.roleSelection = this.roleSelection.split('-')[0];
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
    this.loading = true;
    const variables = {
      language: 'ET',
      id: this.userData.drupal.uid,
    };

    const path = this.settings.query('customFavorites', variables);

    const subscription = this.http.get(path, { headers: this.headers })
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
          this.loading = false;
          subscription.unsubscribe();
        });
  }

  getEventList(): void {
    this.loading = true;
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

    const subscription = this.http.get(path, { headers: this.headers })
    .subscribe((response: any) => {
      const data = response.data.nodeQuery.entities;
      if (data && data.length) {
        this.sidebar.entity.events = data.sort((a, b) => {
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
        this.sidebar.entity.events = [];
      }
      this.loading = false;
      subscription.unsubscribe();
    });
  }
}
