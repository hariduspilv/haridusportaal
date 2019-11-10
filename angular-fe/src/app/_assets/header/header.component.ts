import { Component, OnInit, HostBinding, Input } from '@angular/core';
import { SidemenuService, ModalService, AuthService, SettingsService } from '@app/_services';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'htm-header',
  templateUrl: './header.template.html',
  styleUrls: ['./header.styles.scss'],
})

export class HeaderComponent implements OnInit {
  public active: boolean;
  @Input() loginStatus: boolean = false;
  @Input() user: string = '';
  @HostBinding('class') get hostClasses(): string {
    return 'header';
  }
  @HostBinding('attr.aria-label') ariaLabel:string = this.translate.get('frontpage.header');
  @HostBinding('attr.role') role:string = 'banner';
  public search;
  public logoutActive = false;

  public loading = false;
  public mobileId = {
    handshake: '',
    challengeId: '',
    session_code: '',
    id_code: '',
  };
  public loginForm: FormGroup = this.formBuilder.group({
    password: ['', Validators.required],
    username: ['', Validators.required],
    auth_method: ['basic'],
  });

  public mobileIdForm: FormGroup = this.formBuilder.group({
    phoneNumber: ['', Validators.required],
    auth_method: ['mobileId'],
  });

  constructor(
    private sidemenuService: SidemenuService,
    public modalService: ModalService,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    public auth: AuthService,
    private settings: SettingsService,
    private http: HttpClient,
  ) {}

  public basicLogin():void {
    const data = this.loginForm.value;
    const subscription = this.auth.login(data).subscribe((response) => {
      this.modalService.close('login');
      subscription.unsubscribe();
    });
  }

  public taraLogin():void {
    window.location.href = `${this.settings.url}/external-login/tara`;
  }

  public harIdLogin():void {
    window.location.href = `${this.settings.url}/external-login/harid`;
  }

  // needs to be finished
  public mobileIdLogin():void {
    const data = this.loginForm.value;
    this.http.post(
      `${this.settings.url}${this.settings.mobileLogin}`,
      { telno: this.mobileIdForm.controls.phoneNumber.value },
    ).subscribe(
      (data:any) => {
        console.log(data);
        const consecutiveForm = {
          challengeId: data.ChallengeID,
          session_code: data.Sesscode,
          id_code: data.UserIDCode,
        };
      },
      (data: any) => {
        this.loading = false;
      },
    );
    const subscription = this.auth.login(data).subscribe((response) => {
      this.modalService.close('login');
      subscription.unsubscribe();
    });
  }

  toggleSidemenu(): void {
    this.sidemenuService.toggle();
    this.active = this.sidemenuService.isVisible;
  }

  subscribeToAuth() {
    this.auth.isAuthenticated.subscribe((val) => {
      this.loginStatus = val;
    });
  }

  ngOnInit(): void {
    this.active = this.sidemenuService.isVisible;
    this.subscribeToAuth();
  }
}
