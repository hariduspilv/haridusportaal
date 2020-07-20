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

  /**
   * Retrieve single alert instance from alerts service
   * @param {string} id - Alerts ID
   */

  getAlertsFromBlock(id: string) {
    return this.subject.asObservable().pipe(
      filter((alert: Alert) => alert && alert.id === id),
    );
  }

  warning(...args);
  /**
   * Warning alerts service
   * @param message - Message to show in the alert
   * @param [id] - Alerts ID
   * @param [category] - Group alert by category
   * @param [closeable] - Can the user close this alert
   * @param [link] - Generates a link in the notification
   */
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
  /**
   * Success alerts service
   * @param message - Message to show in the alert
   * @param [id] - Alerts ID
   * @param [category] - Group alert by category
   * @param [closeable] - Can the user close this alert
   * @param [link] - Generates a link in the notification
   */
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
  /**
   * Info alerts service
   * @param message - Message to show in the alert
   * @param [id] - Alerts ID
   * @param [category] - Group alert by category
   * @param [closeable] - Can the user close this alert
   * @param [link] - Generates a link in the notification
   */
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
  /**
   * Error alerts service
   * @param message - Message to show in the alert
   * @param [id] - Alerts ID
   * @param [category] - Group alert by category
   * @param [closeable] - Can the user close this alert
   * @param [link] - Generates a link in the notification
   */
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

  /**
   * Notifys alerts service
   * @param alert - Alert service object
   */
  notify(alert: Alert) {
    const normalizedAlert = { ...alert, message: alert.message ? alert.message.toString() : '' };
    this.subject.next(normalizedAlert);
  }

  /**
   * Clears alerts service
   * @param id - Which alert to clear
   */
  clear(id: string) {
    this.notify(new Alert({ id }));
  }
}
