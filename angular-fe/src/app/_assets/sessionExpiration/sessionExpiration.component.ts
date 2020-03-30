import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService, ModalService, SettingsService } from '@app/_services';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'sessionExpiration',
  templateUrl: 'sessionExpiration.template.html',
  styleUrls: ['sessionExpiration.styles.scss'],
})

export class SessionExpirationComponent implements OnInit, OnDestroy {

  public countDownTime: number; /* Comes from translations. See ngOnInit */
  public timeLeft: number = 0;
  public timeout;
  public counterInterval;
  public modalTitle: string = this.translate.get('session.expiring');
  public renewLoader: boolean = false;
  private loginSubscription: Subscription;

  constructor(
    public modalService: ModalService,
    private auth: AuthService,
    private translate: TranslateService,
    private http: HttpClient,
    private settings: SettingsService,
  ) {
  }

  public logOut(): void {
    this.auth.logout();
    clearTimeout(this.timeout);
    clearInterval(this.counterInterval);

  }

  public modalClosed($event): void {

  }

  public renewLogin(): void {
    this.renewLoader = true;
    const subscription = this.http.get(`${this.settings.url}/api/v1/token-renew?_format=json`)
      .subscribe((response) => {
        if (response['token']) {
          this.auth.refreshUser(response['token']);
          this.modalService.close('sessionExpirationModal');
          this.checkExpiration();
        } else {
          this.logOut();
          clearTimeout(this.timeout);
          clearInterval(this.counterInterval);
        }
        this.renewLoader = false;
      });
  }

  ngOnInit() {
    // tslint:disable-next-line: radix
    this.countDownTime = parseInt(this.translate.get('session.timeout')) || 100;
    this.watchLogin();

  }

  ngOnDestroy() {
    this.loginSubscription.unsubscribe();
  }

  private count(): void {
    const expires = this.auth.expireTime();
    clearInterval(this.counterInterval);
    this.timeLeft = this.countDownTime;
    if (expires) {
      this.counterInterval = setInterval(
        () => {
          this.timeLeft = this.timeLeft - 1;
          if (this.timeLeft === 0) {
            this.showLoginMessage();
          }
        },
        1000);
    } else {
      this.timeLeft = 0;
    }
  }

  private showLoginMessage(): void {
    this.logOut();
    clearInterval(this.counterInterval);
    this.modalTitle = this.translate.get('session.expired');
    if (!this.modalService.isOpen('sessionExpirationModal')) {
      this.modalService.open('sessionExpirationModal');
    }
  }

  private checkExpiration(): void {
    const expires = this.auth.expireTime();
    clearTimeout(this.timeout);
    clearInterval(this.counterInterval);
    if (expires) {
      const currentTime = new Date().getTime();
      this.timeLeft = Math.ceil((expires - currentTime) / 1000);

      /* Debug timer */
      const sessionTest = window.location.href.match('sessionTest') ? true : false;

      if (sessionTest) {
        this.timeLeft = this.countDownTime + 2;
      }
      const countDown = this.timeLeft - this.countDownTime;

      this.timeout = setTimeout(
        () => {
          this.count();
          this.modalService.open('sessionExpirationModal');
        },
        countDown * 1000);
    }
  }

  private watchLogin(): void {
    this.loginSubscription = this.auth.isAuthenticated.subscribe((response) => {
      if (response) {
        this.checkExpiration();
      } else {
        clearTimeout(this.timeout);
        clearInterval(this.counterInterval);
      }
    });
  }
}
