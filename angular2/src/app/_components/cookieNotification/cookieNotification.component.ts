import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "cookie-notification",
  templateUrl: "cookieNotification.template.html",
  styleUrls: ["cookieNotification.styles.scss"]
})

export class CookieNotification{
  @Input() link: any;
  @Output() action: EventEmitter<any> = new EventEmitter<any>();
  @Output() close: EventEmitter<any> = new EventEmitter<any>();

  agree() {
    this.action.emit(true);
  }

  closeNotification() {
    this.close.emit(true);
  }
}