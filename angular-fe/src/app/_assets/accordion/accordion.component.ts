import {
  Component,
  Input,
  HostBinding,
  ContentChildren,
  QueryList,
  AfterContentInit,
  OnChanges,
  OnDestroy,
  ElementRef,
  forwardRef,
} from '@angular/core';

import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Subject } from 'rxjs';
import { RippleService } from '@app/_services';

@Component({
  selector: 'accordion-item',
  templateUrl: './accordion-item.template.html',
  animations: [
    trigger('toggleBody', [
      state('collapsed, void', style({ height: '0px', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('* => *', [
        animate('225ms cubic-bezier(0.4,0.0,0.2,1)'),
      ]),
    ]),
  ],
})

export class AccordionItemComponent {
  public visible: boolean = false;
  public styleState: boolean = false;
  public bodyClass: string = '';
  public change = new Subject<any>();
  public id: string = Math.random().toString(36).substr(2, 9);

  @Input() title: string = '';
  @Input() active: boolean = false;
  @HostBinding('class') get hostClasses(): string {
    return 'accordion__item';
  }

  constructor(
    private ripple: RippleService,
    private el: ElementRef,
  ) {}

  public openAccordion($event) {
    if (this.styleState === this.active) {
      this.active = !this.active;
    }
    if (this.active) {
      this.change.next();
    }
  }

  public closeAccordion() {
    this.active = false;
  }

  animationDone() {
    if (!this.active) {
      this.styleState = false;
    }
  }

  animationStart() {
    if (this.active) {
      this.styleState = true;
    }
  }
}

@Component({
  selector: 'accordion',
  templateUrl: './accordion.template.html',
  styleUrls: ['./accordion.styles.scss'],
})

export class AccordionComponent implements AfterContentInit, OnChanges, OnDestroy{

  private subscriptions = [];

  @Input() collapsible: boolean = false;

  @HostBinding('class') get hostClasses(): string {
    return 'accordion';
  }

  @ContentChildren(forwardRef(() => AccordionItemComponent))
    items: QueryList<AccordionItemComponent>;

  closeOthers() {
    if (this.collapsible) {
      const items = this.items.toArray();
      items.forEach((item) => {
        this.subscriptions.push(item.change.subscribe((response) => {
          const id = item.id;
          items.forEach((siblingItem) => {
            const siblingId = siblingItem.id;
            if (id !== siblingId) {
              siblingItem.closeAccordion();
            }
          });
        }));
      });
    }
  }

  destroySubscriptions() {
    this.subscriptions.forEach((item) => {
      item.unsubscribe();
    });
  }

  ngAfterContentInit() {
    this.closeOthers();
  }

  ngOnChanges() {
    this.destroySubscriptions();
    this.closeOthers();
  }

  ngOnDestroy() {
    this.destroySubscriptions();
  }

}
