import { Injectable, OnInit } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import 'rxjs/add/operator/filter';
import { Notification, NotificationType } from '../_components/notifications/notification.model';

@Injectable()
export class NotificationService {

  private subject = new Subject<Notification>();
  
  getNotificationsFromBlock(id: string):Observable<any> {
    return this.subject.asObservable().filter((notification: Notification) => notification && notification.id === id);
  }

  warning(message: any, id: string = 'global', closeable: boolean = true) {
    this.notify(new Notification({
      message,
      type: NotificationType.Warning,
      id,
      closeable
    }));
  }

  success(message: any, id: string = 'global', closeable: boolean = true) {
    this.notify(new Notification({
      message,
      type: NotificationType.Success,
      id,
      closeable
    }));
  }

  info(message: any, id: string = 'global', closeable: boolean = true) {
    this.notify(new Notification({
      message,
      type: NotificationType.Info,
      id,
      closeable
    }));
  }

  error(message: any, id: string = 'global', closeable: boolean = true) {
    this.notify(new Notification({
      message,
      type: NotificationType.Error,
      id,
      closeable
    }));
  }

  notify(notification: Notification) {
    const normalizedNotification = {...notification, message: notification.message ? notification.message.toString() : ''};
    this.subject.next(normalizedNotification);
  }
  
  clear(id: string) {
    this.notify(new Notification({id}));
  }
}