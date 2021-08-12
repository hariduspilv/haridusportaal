import { Component, ElementRef, HostBinding, Input, OnDestroy } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { Alert, AlertsService } from '../../_services/AlertsService';
import { CookieService } from '@app/_services/CookieService';

enum AlertIcon {
  'warning' = 'alert-circle',
  'success' = 'check-circle',
  'error' = 'x-circle',
  'info' = 'alert-circle',
}

@Component({
  selector: 'alerts',
  templateUrl: './alerts.template.html',
  styleUrls: ['./alerts.styles.scss'],
  animations: [
    trigger('transform', [
      transition(':enter', [
        style({ opacity: '1', transform: 'scale(0)' }),
        animate('.225s cubic-bezier(0.215, 0.61, 0.355, 1)', style({ transform: 'scale(1)' })),
      ]),
      // transition(':leave', [
      //   style({ opacity: '1' }),
      //   animate('.225s cubic-bezier(0.215, 0.61, 0.355, 1)', style({ opacity: '0' })),
      // ]),
    ]),
  ],
})

export class AlertsComponent implements OnDestroy {

  @Input() id: string = 'global';
  @Input() alerts: Alert[] = [];
  @Input() small: boolean = false;
  @Input() closeMs: number;
  public alertIcons = AlertIcon;
  private alertSubscription: Subscription = new Subscription;
  private subscriptions: Subscription[] = [];
  private removeTimeout: any = false;

  constructor(
    private alertService: AlertsService,
    private cookies: CookieService,
    private el: ElementRef,
  ) {
  }

  @HostBinding('class') get hostClasses(): string {
    const addonClass = this.alerts.length ? 'alerts--active' : '';

    return `alerts ${addonClass}`;
  }

  ngOnInit(): void {
    this.alertSubscription = this.alertService.getAlertsFromBlock(this.id).subscribe(
      (alert: Alert) => {
        if (!alert.message) {
          this.alerts = [];

          return;
        }

        clearTimeout(this.removeTimeout);
        // only one error per category
        if (alert.category !== undefined) {
          this.alerts = this.alerts.filter((x: Alert) => x.category !== alert.category);

          setTimeout(() => this.alerts.push(alert), 250);
        } else {
          this.alerts.push(alert);
        }

        if (this.closeMs) {
          this.removeTimeout = setTimeout(() => this.remove(alert), this.closeMs);
        }

        if (alert.closeable) {
          setTimeout(() => this.el.nativeElement.querySelector('.alert__close').focus(), 500);
        }
      });

    this.subscriptions.push(this.alertSubscription);
  }

  remove(alert) {
    this.alerts = this.alerts.filter(item => item !== alert);
    this.alertService.close(this.alerts);
  }

  destroySubscriptions() {
    this.subscriptions.forEach((item) => {
      item.unsubscribe();
    });
  }

  ngOnDestroy() {
    this.destroySubscriptions();
  }
}
