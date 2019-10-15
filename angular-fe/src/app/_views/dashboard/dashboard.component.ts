import {
    Component,
    OnInit,
    Input,
  } from '@angular/core';
import { UserService } from '@app/_services/userService';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { SettingsService, AlertsService, ModalService } from '@app/_services';
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
  loading = false;
  userData: any;
  headers: HttpHeaders;
  error = false;

  constructor(
    private modalService: ModalService,
    private user: UserService,
    private http: HttpClient,
    private settings: SettingsService,
    private alertsService: AlertsService,
  ) {}

  ngOnInit() {
    this.jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE1NzExMzg0NDYsImV4cCI6MTU3MTE0MjA0NiwiZHJ1cGFsIjp7InVpZCI6IjY5OSJ9LCJyb2xlIjp7ImN1cnJlbnRfcm9sZSI6eyJ0eXBlIjoibmF0dXJhbF9wZXJzb24ifX0sInVzZXJuYW1lIjoiMzgyMDEyNDAzMTkiLCJmaXJzdG5hbWUiOm51bGwsImxhc3RuYW1lIjpudWxsfQ.pcgKhTP2qsYmUuX9BTJQ49E_3ECY8kOLic_kfMUlbO-udNxeTXgbP-kS8Umg6oColNIAw5Ep90m_iGxjdMsAgw';
    this.userData = this.jwt ? this.user.decodeToken(this.jwt) : this.user.getData();
    
    this.headers = new HttpHeaders;
    this.headers = this.headers.append('Authorization', 'Bearer ' + this.jwt);
  }

  loadUserModal() {
    this.error = false;
    this.loading = true;
    this.modalService.toggle('userModal');

    const sub = this.http.get(this.settings.url + '/dashboard/eeIsikukaart/teachings?_format=json', { headers: this.headers }).subscribe((response: any) => {
      if (response.error) {
        this.alertsService.error(response['error']['message_text']['et'], 'personalData', 'personalData', false, false);
        this.error = true;
      }
      this.loading = false;
      sub.unsubscribe();
    });
  }

  loadRoleChangeModal() {
    this.error = false;
    this.loading = true;
    this.modalService.toggle('roleModal');

    const sub = this.http.get(this.settings.url + '/custom/login/getRoles?_format=json', { headers: this.headers }).subscribe((response: any) => {
      if (response.error) {
        this.alertsService.error(response['error']['message_text']['et'], 'roles', 'roles', false, false);
        this.error = true;
      }
      this.loading = false;
      sub.unsubscribe();
    });
  }
}
