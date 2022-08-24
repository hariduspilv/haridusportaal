import {
  AfterContentInit,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  TemplateRef,
  ContentChild,
  QueryList,
} from '@angular/core';

import { animate, state, style, transition, trigger } from '@angular/animations';
import { Subject } from 'rxjs';
import { RippleService } from '@app/_services';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { SlugifyPipe } from 'ngx-pipes';
import { ScrollableContentComponent } from '../scrollableContent';
import { slugifyTitle } from '@app/_core/utility';

@Component({
  selector: 'accordion-item',
  templateUrl: './accordion-item.template.html',
  providers: [SlugifyPipe],
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
  public statusUpdate = new Subject<any>();
  public id: string = Math.random().toString(36).substr(2, 9);
  @ContentChildren(forwardRef(() => ScrollableContentComponent), { descendants: true })
    scrollable: QueryList<ScrollableContentComponent>;
  @ContentChild(TemplateRef) templateRef: TemplateRef<any>;
  @Input() title: string = '';
  @Input() active: boolean = false;
  private scroll: boolean = false;

  constructor(
    private ripple: RippleService,
    private el: ElementRef,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  @HostBinding('class') get hostClasses(): string {
    return 'accordion__item';
  }

  public openAccordion($event?, skipRoute = false) {
    if ($event) {
      $event.preventDefault();
    }

    if (this.styleState === this.active) {
      this.active = !this.active;
    }

    if (this.active) {
      try {
        this.scrollable.forEach((item) => {
          // item.detectWidth();
          item.checkArrows();
        });
      } catch (err) {
      }
      this.change.next(true);
    }

    const slug = slugifyTitle(this.title);
    const newUrl = this.router.url.split('#')[0];
    this.statusUpdate.next(true);
    if (this.active && !skipRoute) {
      this.location.replaceState(`${newUrl}#${slug}`);
    }
  }

  public closeAccordion() {
    this.active = false;
  }

  animationDone() {
    if (!this.active) {
      this.styleState = false;
    }

    const appContent = document.querySelector('.app-content');
    const scrollPosition = appContent.scrollTop;
    const elementScrollOffset = this.el.nativeElement.getBoundingClientRect().top;

    if (this.scroll) {
      appContent.scrollTop = elementScrollOffset - 100;
      this.scroll = false;
    } else {
      if (elementScrollOffset < 0 && this.active) {
        appContent.scrollTop = scrollPosition + elementScrollOffset - 100;
      }
    }
  }

  animationStart() {
    if (this.active) {
      this.styleState = true;
    }
  }

  ngOnInit(): void {
    const slug = this.title.toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^A-Za-z0-9üõöä]+/igm, '-');
    if (this.route.snapshot.fragment === slug) {
      this.scroll = true;
      setTimeout(
        () => {
          this.openAccordion();
        },
        0);
    }
  }
}

@Component({
  selector: 'accordion',
  templateUrl: './accordion.template.html',
  styleUrls: ['./accordion.styles.scss'],
})

export class AccordionComponent implements AfterContentInit, OnChanges, OnDestroy {

  @Input() collapsible: boolean = false;
  @Input() openFirst = false;
  @Output() onChange: EventEmitter<any> = new EventEmitter();
  @ContentChildren(forwardRef(() => AccordionItemComponent))
  items: QueryList<AccordionItemComponent>;
  private subscriptions = [];

  constructor(
    private router: Router,
    private location: Location,
  ) {
  }

  @HostBinding('class') get hostClasses(): string {
    return 'accordion';
  }

  closeOthers() {
    if (this.collapsible && this.items) {
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

  closeAll() {
    const items = this.items.toArray();
    items.forEach((item) => {
      item.active = false;
    });
    this.countAccordions();
  }

  openAll() {
    const items = this.items.toArray();
    items.forEach((item) => {
      item.active = true;
    });
    this.countAccordions();
  }

  countAccordions() {
    const itemsData = this.items.map((entity) => {
      return {
        isActive: entity.active,
        id: entity.id,
        title: entity.title,
      };
    });
    const totalOpened = itemsData.filter((item) => {
      return item.isActive ? item : false;
    }).length;

    if (totalOpened === 0) {
      const newUrl = this.router.url.split('#')[0];
      this.location.replaceState(`${newUrl}`);
    }
    this.onChange.emit(itemsData);
  }

  watchItems() {
    const items = this.items.toArray();
    items.forEach((item) => {
      this.subscriptions.push(item.statusUpdate.subscribe((response) => {
        this.countAccordions();
      }));
    });

    this.countAccordions();
  }

  openFirstOne() {
    if (!this.openFirst) {
      return;
    }

    const items = this.items.toArray();
    if (items.length && !items.some((accordion) => accordion.active)) {
      items[0].openAccordion(undefined, true);
    }
  }

  destroySubscriptions() {
    this.subscriptions.forEach((item) => {
      item.unsubscribe();
    });
  }

  ngAfterContentInit() {
    setTimeout(
      () => {
        this.openFirstOne();
        this.closeOthers();
        this.watchItems();
      },
      0);
  }

  ngOnChanges() {
    this.destroySubscriptions();
    this.closeOthers();
  }

  ngOnDestroy() {
    this.destroySubscriptions();
  }
}
