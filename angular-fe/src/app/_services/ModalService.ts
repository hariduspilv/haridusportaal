import { Injectable } from '@angular/core';
import { focus } from '@app/_core/utility';

@Injectable()
export class ModalService {
  public modals: any[] = [];
  public modalOpened: Object = {};

  add(modal: any) {
    this.modals.push(modal);
    this.modalOpened[modal.id] = false;
  }

  remove(id: string) {
    this.modals = this.modals.filter(x => x.id !== id);
  }

  toggle(id: string) {
    // Close other modals and open selected if it isn't already open
    this.modals.forEach((modal) => {
      if (modal.id === id && !this.modalOpened[id]) {
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

  open(id: string) {
    const modal = this.modals.find(x => x.id === id);
    modal.stateChange(true);
  }

  focusLock() {
    const openedArr = Object.keys(this.modalOpened).filter(elem => this.modalOpened[elem]);
    if (openedArr.length) {
      const id = `modal-${openedArr.reduce(elem => elem)}`;
      focus(id);
    }
  }
}
