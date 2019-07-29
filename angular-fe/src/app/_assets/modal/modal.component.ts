import { Component, Input, OnInit, ElementRef, HostBinding } from '@angular/core';
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
  @Input() titleExists: boolean = true;
  @Input() topAction: boolean = true;
  @Input() bottomAction: boolean = true;
  @Input() loading: boolean = false;
  // Modal opening button for story
  @Input() stateButton: boolean = false;
  @HostBinding('class') get hostClasses(): string {
    return this.opened ? 'modal modal-open' : 'modal';
  }

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
  }

  stateChange(state: boolean): void {
    this.opened = state;
  }
}
