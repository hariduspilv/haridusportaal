import {
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewChildren,
} from '@angular/core';
import { ModalService } from '@app/_services';

@Component({
  selector: 'modal-content',
  template:
    '<ng-content *ngIf="!loading"></ng-content>' +
    '<loader *ngIf="loading"></loader>',
})
export class ModalContentComponent {
  @Input() public id: string;
  @Input() public loading: boolean = false;
  @ContentChild(TemplateRef) public templateRef: TemplateRef<any>;
}

@Component({
  selector: 'htm-modal',
  templateUrl: './modal.template.html',
  styleUrls: ['./modal.styles.scss'],
})
export class ModalComponent implements OnInit {

  @Input() public id: string;
  @Input() public blockModal: boolean = true;
  @Input() public modalTitle: string = '';
  public opened: boolean = false;
  @Input() public titleExists: boolean = true;
  @Input() public topAction: boolean = true;
  @Input() public bottomAction: boolean = true;
  @Input() public size: string = 'default';
  @Input() public reloadOnClose: boolean = false;
  @Input() public initializeAsOpen: boolean = false;
  @Output() public onClose: EventEmitter<any> = new EventEmitter();
  @ViewChildren('modalContent') public contents: QueryList<any> = new QueryList();
  @ContentChild(TemplateRef) public templateRef: TemplateRef<any>;
  private element: any;

  constructor(private elem: ElementRef, private modalService: ModalService) {
    this.element = elem.nativeElement;
  }

  @HostBinding('class') get hostClasses(): string {
    const classes = [];
    classes.push(this.opened ? '' : 'modal-hidden');
    classes.push(`size-${this.size}`);
    return classes.join(' ');
  }

  @HostListener('document:keydown', ['$event'])
  public onKeyDownHandler(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.stateChange(false);
    }
  }

  public ngOnInit() {
    this.modalService.add(this);
    if (this.initializeAsOpen) this.stateChange(true);
  }

  public ngOnDestroy(): void {
    this.modalService.remove(this.id);
  }

  public stateChange(state: boolean): void {
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
