import { Injectable, OnInit } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export enum AlertType {
  Warning = 'warning',
  Info = 'info',
  Success = 'success',
  Error = 'error',
}

export class Alert {
  message: string;
  type: AlertType;
  id?: string;
  closeable?: boolean;
  httpStatus?: number;
  constructor(init?:Partial<Alert>) {
    Object.assign(this, { closeable: true, id: 'global' } , init);
  }
}

@Injectable()
export default class AlertsService {

  private subject:Subject<Alert> = new Subject<Alert>();

  getAlertsFromBlock(id: string) {
    return this.subject.asObservable().pipe(
      filter((alert: Alert) => alert && alert.id === id),
    );
  }

  warning(message: string, id?: string, closeable?: boolean) {
    this.notify(new Alert({
      message,
      id,
      closeable,
      type: AlertType.Warning,
    }));
  }

  success(message: string, id?: string, closeable?: boolean) {
    this.notify(new Alert({
      message,
      id,
      closeable,
      type: AlertType.Success,
    }));
  }

  info(message: string, id?: string, closeable?: boolean) {
    this.notify(new Alert({
      message,
      id,
      closeable,
      type: AlertType.Info,
    }));
  }

  error(message: string, id?: string, closeable?: boolean) {
    this.notify(new Alert({
      message,
      id,
      closeable,
      type: AlertType.Error,
    }));
  }

  notify(alert: Alert) {
    const normalizedAlert = { ...alert, message: alert.message ? alert.message.toString() : '' };
    this.subject.next(normalizedAlert);
  }

  clear(id: string) {
    this.notify(new alert({ id }));
  }
}
