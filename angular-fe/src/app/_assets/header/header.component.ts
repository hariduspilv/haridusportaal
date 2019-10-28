import { Component, OnInit, HostBinding, Input } from '@angular/core';
import { SidemenuService, ModalService, AuthService } from '@app/_services';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';

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
  public loginForm: FormGroup = this.formBuilder.group({
    password: ['', Validators.required],
    username: ['', Validators.required],
    auth_method: ['basic'],
  });

  constructor(
    private sidemenuService: SidemenuService,
    public modalService: ModalService,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private auth: AuthService,
  ) {}

  public basicLogin():void {
    const data = this.loginForm.value;
    const subscription = this.auth.login(data).subscribe((response) => {
      this.modalService.close('login');
      subscription.unsubscribe();
    });
  }

  toggleSidemenu(): void {
    this.sidemenuService.toggle();
    this.active = this.sidemenuService.isVisible;
  }

  ngOnInit(): void {
    this.active = this.sidemenuService.isVisible;
  }
}
