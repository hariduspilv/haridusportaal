import {
  Component,
  HostBinding,
  OnDestroy,
  Input,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertsService, Alert } from '../../_services/AlertsService';

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
})

export class AlertsComponent implements OnDestroy {

  @Input() id: string = 'global';
  @Input() alerts: Alert[] = [];
  @Input() small: boolean = false;

  @HostBinding('class') get hostClasses(): string {
    return 'alerts';
  }
  public alertIcons = AlertIcon;
  private alertSubscription: Subscription = new Subscription;
  private subscriptions:Subscription[] = [];

  constructor(
    private alertService: AlertsService,
  ) {}

  ngOnInit(): void {
    this.alertSubscription = this.alertService.getAlertsFromBlock(this.id).subscribe(
      (alert: Alert) => {
        if (!alert.message) {
          this.alerts = [];
          return;
        }
        // only one error per HTTP status code
        if (alert.identifier !== undefined) {
          this.alerts = this.alerts.filter((x: Alert) => x.identifier !== alert.identifier);
        }
        this.alerts.push(alert);
      });
    this.subscriptions.push(this.alertSubscription);
  }

  remove(alert) {
    this.alerts = this.alerts.filter(item => item.id !== alert.id);
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
