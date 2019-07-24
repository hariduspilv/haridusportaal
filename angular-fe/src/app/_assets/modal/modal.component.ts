import { Component, Input, OnInit, ElementRef } from '@angular/core';
import ModalService from '@app/_services/ModalService';

@Component({
  selector: 'modal-content',
  template: '<ng-content></ng-content>',
})

export class ModalContentComponent {}

@Component({
  selector: 'htm-modal',
  templateUrl: './modal.template.html',
  styleUrls: ['./modal.styles.scss'],
})

export class ModalComponent implements OnInit {
  @Input() id: string;
  @Input() title: string = '';
  public opened: boolean = false;
  private element: any;
  // Story opening button and knob inputs
  @Input() stateButton: boolean = false;
  @Input() titleExists: boolean = true;
  @Input() topAction: boolean = true;
  @Input() bottomAction: boolean = true;

  constructor(
    private elem: ElementRef,
    private modalService: ModalService,
  ) {
    this.element = elem.nativeElement;
  }

  ngOnInit() {
    // Outside click close
    this.element.addEventListener('click', (el) => {
      if (el.target.className && el.target.className.includes('modal__backdrop')) {
        this.stateChange(false);
      }
    });
    this.modalService.add(this);
  }

  ngOnDestroy(): void {
    this.modalService.remove(this.id);
    this.element.remove();
  }

  stateChange(state: boolean): void {
    this.opened = state;
  }
}
