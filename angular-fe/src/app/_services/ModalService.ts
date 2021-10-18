import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';

@Injectable()
export class ModalService {
  public modals: any[] = [];
  public modalOpened: {} = {};
  public lastActiveElement = null;

  /**
   * Add modal to ModalService
   * @param modal - modal object
   */
  public add(modal: any) {
    this.modals.push(modal);
    this.modalOpened[modal.id] = false;
  }

  /**
   * Remove modal from ModalService
   * @param id - ID of modal to be removed
   */
  public remove(id: string) {
    this.modals = this.modals.filter(x => x.id !== id);
  }

  /**
   * Show/Hide modal
   * @param id - ID of modal to be toggled
   */
  public toggle(id: string) {
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
          setTimeout(() => {
            val.first.nativeElement.focus();
          });
        });
      } else {
        modal.contents.first.nativeElement.removeAttribute('tabIndex');
        modal.stateChange(false);
      }
    });
  }

  /**
   * Closes modal
   * @param id - ID of modal to be closed
   */
  public close(id: string) {
    const modal = this.modals.find(x => x.id === id);
    if (this.lastActiveElement) {
      this.lastActiveElement.focus();
      this.lastActiveElement = null;
    }
    modal.stateChange(false);
  }

  /**
   * Opens modal
   * @param id - ID of modal to be opened
   */
  public open(id: string) {
    const modal = this.modals.find(x => x.id === id);
    modal.stateChange(true);
    modal.contents.changes.pipe(take(1)).subscribe((val) => {
      setTimeout(() => {
        val.first.nativeElement.focus();
      });
    });
  }

  /**
   * Check if modal is opened
   * @param id - ID of modal to check
   */
  public isOpen(id: string) {
    return this.modalOpened[id];
  }

  /**
   * Lock fockus to active modal
   */
  public focusLock() {
    // const openedArr = Object.keys(this.modalOpened).filter(elem => this.modalOpened[elem]);
    //     // if (openedArr.length) {
    //     //   const id = `modal-${openedArr.reduce(elem => elem)}`;
    //     //   focus(id);
    //     // }
  }
}
