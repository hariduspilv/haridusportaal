import {
    Component,
    OnInit,
    Input,
  } from '@angular/core';
import { UserService } from '@app/_services/userService';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { SettingsService, AlertsService, ModalService, RootScopeService } from '@app/_services';
@Component({
  selector: 'dashboard-view',
  templateUrl: 'dashboard.template.html',
  styleUrls: ['dashboard.styles.scss'],
})

  export class DashboardComponent implements OnInit{
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
  personalDataFields = ['isikukood', 'synniKp', 'elukohamaa', 'rrElukoht', 'kodakondsus', 'elamisluba'];
  currentRole: any;
  roleSelection: any;
  codeSelection: any;
  initialRole: any;
  roleNaturalOptions: any;
  roleJuridicalOptions: [];

  constructor(
    private modalService: ModalService,
    private user: UserService,
    private http: HttpClient,
    private settings: SettingsService,
    private alertsService: AlertsService,
    private rootScope: RootScopeService,
  ) {}

  ngOnInit() {
    this.jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE1NzE3MzM5MDcsImV4cCI6MTU3MTczNzUwNywiZHJ1cGFsIjp7InVpZCI6IjY5OSJ9LCJyb2xlIjp7ImN1cnJlbnRfcm9sZSI6eyJ0eXBlIjoianVyaWRpY2FsX3BlcnNvbiIsImRhdGEiOnsicmVnX2tvb2QiOjEyNjE1OTEzLCJuaW1pIjoiVW5kZXJzdGFuZCBVXHUwMGRjIn19fSwidXNlcm5hbWUiOiIzODIwMTI0MDMxOSIsImZpcnN0bmFtZSI6IlRhbmVsIiwibGFzdG5hbWUiOiJUcm9tcCJ9.Ib9BCcVlnIG4X29d6QWWcXIDv4yePbFVEPAoyH6AYpalvtJRJrK7iPndudQrgV1P3u9xQylCkhj2p9qSczB9gw';
    this.userData = this.jwt ? this.user.decodeToken(this.jwt) : this.user.getData();

    this.currentRole = this.userData.role.current_role.type;
    this.headers = new HttpHeaders;
    this.headers = this.headers.append('Authorization', 'Bearer ' + this.jwt);
  }

  loadUserModal() {
    this.error = false;
    this.loading = true;
    this.modalService.toggle('userModal');

    const sub = this.http.get(this.settings.url + '/dashboard/eeIsikukaart/personal_data?_format=json', { headers: this.headers }).subscribe((response: any) => {
      if (response.error) {
        this.alertsService.error(response['error']['message_text']['et'], 'personalData', 'personalData', false, false);
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
    this.codeSelection = this.userData.role.current_role.data ? this.userData.role.current_role.data.reg_kood : null;
    this.roleSelection = this.userData.role.current_role.type;
    if (this.roleSelection === 'juridical_person') {
      this.roleSelection = "juridical-" + this.codeSelection;
    }
    this.initialRole = this.roleSelection;
    const sub = this.http.get(this.settings.url + '/custom/login/getRoles?_format=json', { headers: this.headers }).subscribe((response: any) => {
      if (response.error) {
        this.alertsService.error(response['error']['message_text']['et'], 'roles', 'roles', false, false);
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
    let data = {
      type: this.roleSelection,
      id: this.codeSelection
    };
    let sub = this.http.post(this.settings.url + '/custom/login/setRole', data, { headers: this.headers }).subscribe((response: any) => {
      if (response['token']) {
        this.user.storeData(response['token']);
      }
      sub.unsubscribe();
      this.rootScope.set('roleChanged', true);
      this.modalService.close('roleModal');
    }, (err) => {
      if (err['message'] || err['error']['message']) {
        this.error = true
        this.alertsService.error(err['error']['message'] || err['message'], 'roles', 'roles', false, false);
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
}
