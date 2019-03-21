export class Notification {
  type: NotificationType;
  id: string;
  message: string;
  closeable: boolean;
  httpStatus: number;
  constructor(init?:Partial<Notification>) {
    Object.assign(this, init);
  }
}

export enum NotificationType {
  Success = 'success',
  Error = 'error',
  Info = 'info',
  Warning = 'warning'
}