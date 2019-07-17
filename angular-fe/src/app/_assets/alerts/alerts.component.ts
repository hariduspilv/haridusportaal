import {
  Component,
  HostBinding,
  OnDestroy,
  Input,
} from '@angular/core';
import { Subscription } from 'rxjs';
import AlertsService, { Alert } from '../../_services/AlertsService';

enum AlertIcon {
  'warning' = 'alert-circle',
  'success' = 'check-circle',
  'error' = 'x-circle',
  'info' = 'alert-circle'
}

@Component({
  selector: 'alerts',
  templateUrl: './alerts.template.html',
  styleUrls: ['./alerts.styles.scss'],
})

export class AlertsComponent implements OnDestroy {

  @Input() id: string = 'global';
  @Input() small: boolean = false;
  @Input() alerts: Alert[] = [];

  @HostBinding('class') get hostClasses(): string {
    const classes = this.small ? 'alerts alerts--small' : 'alerts' 
    return classes;
  }
  public AlertIcons = AlertIcon;
  private alertSubscription: Subscription = new Subscription;
  private subscriptions:Subscription[] = [];

  constructor(
    private alertService: AlertsService
  ){}

  ngOnInit(): void {
    this.alertSubscription = this.alertService.getAlertsFromBlock(this.id).subscribe((alert: Alert) => {
      if (!alert.message) {
        this.alerts = [];
        return;
      }
      if(alert.httpStatus !== undefined) {
        if(this.alerts.find((x: Alert) => x.httpStatus === alert.httpStatus)) return;
      }
      this.alerts.push(alert);
    });
    this.subscriptions.push(this.alertSubscription);
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
