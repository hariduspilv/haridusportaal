import {
  Component,
  Input,
  OnInit,
  ElementRef,
  HostBinding,
  Output,
  EventEmitter,
} from '@angular/core';
import { ModalService } from '@app/_services';

@Component({
  selector: 'modal-content',
  template: '<ng-content *ngIf="!loading"></ng-content>' +
  '<loader *ngIf="loading"></loader>',
})

export class ModalContentComponent {
  @Input() id: string;
  @Input() loading: boolean = false;
  constructor(private modalService: ModalService) {}
  ngOnInit() {
    this.modalService.focusLock();
  }
}

@Component({
  selector: 'htm-modal',
  templateUrl: './modal.template.html',
  styleUrls: ['./modal.styles.scss'],
})

export class ModalComponent implements OnInit {
  @Input() id: string;
  @Input() modalTitle: string = '';
  public opened: boolean = false;
  private element: any;
  public modalIds: any;
  @Input() titleExists: boolean = true;
  @Input() topAction: boolean = true;
  @Input() bottomAction: boolean = true;
  @Input() size: string = 'default';
  @Input() reloadOnClose: boolean = false;
  // Modal opening button for story
  @Input() stateButton: boolean = false;
  @Output() onClose: EventEmitter<any> = new EventEmitter();

  @HostBinding('class') get hostClasses(): string {
    const classes = [];
    classes.push(this.opened ? '' : 'modal-hidden');
    classes.push(`size-${this.size}`);
    return classes.join(' ');
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
    // Modal selection in story
    if (this.modalService.modals && this.modalService.modals.length) {
      this.modalIds = this.modalService.modals.map(item => item.id);
    }
  }

  ngOnDestroy(): void {
    this.modalService.remove(this.id);
  }

  stateChange(state: boolean): void {
    const isOpened = this.modalService.modalOpened[this.id];
    this.modalService.modalOpened[this.id] = state;
    if (this.opened && !state && this.reloadOnClose) {
      window.location.reload();
    }
    this.opened = state;
    if (isOpened && !state) {
      this.onClose.emit(true);
    }
  }
}
