import { Injectable } from '@angular/core';
import { focus } from '@app/_core/utility';
import { skip, take } from 'rxjs/operators';

@Injectable()
export class ModalService {
  public modals: any[] = [];
  public modalOpened: Object = {};
  public lastActiveElement = null;

  add(modal: any) {
    this.modals.push(modal);
    this.modalOpened[modal.id] = false;
  }

  remove(id: string) {
    this.modals = this.modals.filter(x => x.id !== id);
  }

  toggle(id: string) {
    // Close other modals and open selected if it isn't already open
    if (this.lastActiveElement && this.modalOpened[id]) {
      this.lastActiveElement.focus();
      this.lastActiveElement = null;
    }
    const isModalOpen = this.modals.some((el) => {
      return el.opened === true;
    });
    if (!isModalOpen) {
      this.lastActiveElement = document.activeElement;
    }
    this.modals.forEach((modal) => {
      if (modal.id === id && !this.modalOpened[id]) {
        modal.stateChange(true);
        modal.contents.changes.pipe(take(1)).subscribe((val) => {
          val.first.nativeElement.setAttribute('tabIndex', -1);
          val.first.nativeElement.focus();
        });
      } else {
        modal.contents.first.nativeElement.removeAttribute('tabIndex');
        modal.stateChange(false);
      }
    });
  }

  close(id: string) {
    const modal = this.modals.find(x => x.id === id);
    if (this.lastActiveElement) {
      this.lastActiveElement.focus();
      this.lastActiveElement = null;
    }
    modal.stateChange(false);
  }

  open(id: string) {
    const modal = this.modals.find(x => x.id === id);
    modal.stateChange(true);
  }

  isOpen(id: string) {
    return this.modalOpened[id];
  }

  focusLock() {
    // const openedArr = Object.keys(this.modalOpened).filter(elem => this.modalOpened[elem]);
    // if (openedArr.length) {
    //   const id = `modal-${openedArr.reduce(elem => elem)}`;
    //   focus(id);
    // }
  }
}
