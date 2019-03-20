import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { NotificationService } from '@app/_services/notificationService';
import { Subscription } from 'rxjs';

@Component({
  selector: 'notifications',
  templateUrl: 'notifications.component.html',
  styleUrls: ['./notification.component.scss'],
})

export class NotificationComponent implements OnInit, OnDestroy {
  @Input() id: string = 'global';

  notificationSubscription: Subscription;
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {};

  ngOnInit(): void {
    this.notificationSubscription = this.notificationService.getNotificationsFromBlock(this.id).subscribe((notification: Notification) => {
      // notification['timeout'] = setTimeout(() => {
      //   this.remove(notification);
      // }, 5000);
      if (!notification['message']) {
        this.notifications = [];
        return;
      }
      console.log(notification);
      if(notification['httpStatus'] !== undefined) {
        if(this.notifications.find((x: Notification) => x['httpStatus'] === notification['httpStatus'])) return;
      }
      this.notifications.push(notification);
    });
  }

  ngOnDestroy(): void {
    this.notificationSubscription.unsubscribe();
  }

  // mouseEnter(notification: Notification) {
  //   clearTimeout(notification['timeout']);
  // }

  remove(notification: Notification) {
    console.log(this.notifications);
    this.notifications = this.notifications.filter(x => x !== notification);
    // clearTimeout(notification['timeout']);
    console.log(this.notifications);
  }

  icon(type: string):string {
    switch (type) {
      case 'success':
        return 'check_circle'
      case 'error':
        return 'highlight_off'
      default: 
        return 'info';
    }
  }
}