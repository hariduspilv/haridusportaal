import { Injectable, OnInit } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export enum AlertType {
  Warning = 'warning',
  Info = 'info',
  Success = 'success',
  Error = 'error'
}

export class Alert {
  message: string;
  type: AlertType;
  id?: string;
  closeable?: boolean;
  httpStatus?: number;
  constructor(init?:Partial<Alert>) {
    Object.assign(this, {closeable: true, id: 'global'} , init)
  }
}

@Injectable()
export default class AlertsService {

  private subject:Subject<Alert> = new Subject<Alert>();
  
  getAlertsFromBlock(id: string) {
    return this.subject.asObservable().pipe(
      filter((alert: Alert) => alert && alert.id === id)
    );
  }

  warning(message: string, id?: string, closeable?: boolean) {
    this.notify(new Alert({
      message,
      type: AlertType.Warning,
      id,
      closeable
    }));
  }

  success(message: string, id?: string, closeable?: boolean) {
    this.notify(new Alert({
      message,
      type: AlertType.Success,
      id,
      closeable
    }));
  }

  info(message: string, id?: string, closeable?: boolean) {
    this.notify(new Alert({
      message,
      type: AlertType.Info,
      id,
      closeable
    }));
  }

  error(message: string, id?: string, closeable?: boolean) {
    this.notify(new Alert({
      message,
      type: AlertType.Error,
      id,
      closeable
    }));
  }

  notify(alert: Alert) {
    const normalizedAlert = {...alert, message: alert.message ? alert.message.toString() : ''};
    this.subject.next(normalizedAlert);
  }
  
  clear(id: string) {
    this.notify(new alert({id}));
  }
}