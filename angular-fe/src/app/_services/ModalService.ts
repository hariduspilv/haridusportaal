import { Injectable } from '@angular/core';

@Injectable()
export default class ModalService {
  public modals: any[] = [];

  add(modal: any) {
    this.modals.push(modal);
  }

  remove(id: string) {
    this.modals = this.modals.filter(x => x.id !== id);
  }

  open(id: string) {
    // Close other modals and open selected
    this.modals.forEach((modal) => {
      if (modal.id === id) {
        modal.stateChange(true);
      } else {
        modal.stateChange(false);
      }
    });
  }

  close(id: string) {
    const modal = this.modals.find(x => x.id === id);
    modal.stateChange(false);
  }
}
