import { Injectable, OnInit } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export enum AlertType {
  Warning = 'warning',
  Info = 'info',
  Success = 'success',
  Error = 'error',
  Cookie= 'cookie',
}

export class Alert {
  message: string;
  type: AlertType;
  id?: string;
  closeable?: boolean;
  category?: string;
  link?: Object;
  constructor(init?:Partial<Alert>) {
    Object.assign(this, { closeable: true, id: 'global' } , init);
  }
}

@Injectable({
  providedIn: 'root',
})
export class AlertsService {

  private subject:Subject<Alert> = new Subject<Alert>();

  getAlertsFromBlock(id: string) {
    return this.subject.asObservable().pipe(
      filter((alert: Alert) => alert && alert.id === id),
    );
  }

  warning(...args);
  warning(message: string, id?: string, category?: string, closeable?: boolean, link?: any) {
    this.notify(new Alert({
      category,
      link,
      message,
      id,
      closeable,
      type: AlertType.Warning,
    }));
  }

  success(...args);
  success(message: string, id?: string, category?: string, closeable?: boolean, link?: any) {
    this.notify(new Alert({
      category,
      link,
      message,
      id,
      closeable,
      type: AlertType.Success,
    }));
  }

  info(...args);
  info(message: string, id?: string, category?: string, closeable?: boolean, link?: any) {
    this.notify(new Alert({
      category,
      link,
      message,
      id,
      closeable,
      type: AlertType.Info,
    }));
  }

  error(...args);
  error(message: string, id?: string, category?: string, closeable?: boolean, link?: any) {
    this.notify(new Alert({
      category,
      link,
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
    this.notify(new Alert({ id }));
  }
}
