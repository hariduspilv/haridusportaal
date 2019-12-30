import {
  Component,
  OnInit,
  ElementRef,
  OnChanges,
  HostListener,
  Input,
  Renderer2,
  OnDestroy,
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'scrollableContent',
  templateUrl: 'scrollableContent.template.html',
  styleUrls: ['./scrollableContent.styles.scss'],
})

export class ScrollableContentComponent implements OnInit, OnChanges, OnDestroy{

  public isScrollable: boolean = false;
  public scrollRunner: any;
  private debounce: any;
  private wrapper: HTMLElement;
  private inline: HTMLElement;
  private scroller: HTMLElement;
  private arrows: NodeList;
  private arrowsPositionDebounce: any = false;
  public scrollDirection: number = 0;
  public canScrollLeft: boolean = false;
  public canScrollRight: boolean = false;

  @Input() changed: any;

  scrollListener: Subscription;
  onScroll() {
    if (this.isScrollable) {
      const timing = this.arrowsPositionDebounce ? 60 : 0;
      clearTimeout(this.arrowsPositionDebounce);
      this.arrowsPositionDebounce = setTimeout(
        () => {
          const wrapperHeight = this.wrapper.offsetHeight;
          const windowHeight = window.innerHeight;
          if (wrapperHeight >= windowHeight) {
            this.positionArrows();
          } else {
            this.centerArrows();
          }
        },
        timing);
    }
  }

  mouseUpListener: Subscription;
  onMouseUp(event) {
    if (this.scrollRunner) {
      clearInterval(this.scrollRunner);
      this.scrollRunner = false;
    }
  }

  resizeListener: Subscription;
  onResize(event) {
    clearTimeout(this.debounce);
    this.debounce = setTimeout(
      () => {
        this.detectWidth();
      },
      300);
  }

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  private centerArrows(): void {
    const wrapperHeight = this.wrapper.offsetHeight;
    this.arrows.forEach((item:HTMLElement) => {
      const el:HTMLElement = item.querySelector('icon');
      el.style.transform = `translateY(${wrapperHeight / 2}px)`;
    });
  }

  private positionArrows(): void {
    const wrapperTop = this.wrapper.offsetTop;
    const windowHeight = window.innerHeight;
    const wrapperHeight = this.wrapper.offsetHeight;
    const scrollTop = window.pageYOffset;
    let top = (windowHeight / 2);

    if (scrollTop - wrapperTop + (windowHeight / 2) > wrapperHeight - (windowHeight / 2)) {
      top = wrapperHeight - (windowHeight / 2);
    } else if (wrapperTop < scrollTop) {
      top += scrollTop - wrapperTop;
    }

    this.arrows.forEach((item:HTMLElement) => {
      const el:HTMLElement = item.querySelector('icon');
      el.style.transform = `translateY(${top}px)`;
    });
  }

  public detectWidth(): void {
    // this.scroller.style.width = '9999px';
    const inline = this.el.nativeElement.querySelector('.scrollable__inline');
    inline.style.width = 'auto';

    setTimeout(
      () => {
        const inlineWidth = inline.offsetWidth === 0 ? '100%' : inline.offsetWidth;
        inline.style.width = `${inlineWidth}px`;
        this.scroller.style.width = '100%';
        const mainWidth = this.el.nativeElement.offsetWidth;
        this.isScrollable = mainWidth < inlineWidth;
      },
      0);
  }

  public checkArrows(): void {
    this.canScrollLeft = this.scroller.scrollLeft <= 0 ? false : true;
    const maxScroll = this.scroller.scrollLeft + this.scroller.offsetWidth;
    this.canScrollRight = this.scroller.scrollWidth <= maxScroll ? false : true;
  }

  public scroll(direction:number = 1): void {

    this.scrollDirection = direction;

    const scroller = this.el.nativeElement.querySelector('.scrollable__scroller');
    let scrollLeft = scroller.scrollLeft;
    const step = 100;

    scrollLeft += direction * step;
    scroller.scroll({
      left: scrollLeft,
      behavior: 'smooth',
    });
  }

  bindListeners() {
    this.resizeListener = fromEvent(window, 'resize').subscribe((e) => {
      this.onResize(e);
    });
    this.scrollListener = fromEvent(window, 'scroll').subscribe((e) => {
      this.onScroll();
    });

  }

  destroyListeners() {
    if (this.resizeListener) this.resizeListener.unsubscribe();
    if (this.scrollListener) this.scrollListener.unsubscribe();
  }

  ngOnInit() {
    this.wrapper = this.el.nativeElement.querySelector('.scrollable__wrapper');
    this.scroller = this.el.nativeElement.querySelector('.scrollable__scroller');
    this.inline = this.el.nativeElement.querySelector('.scrollable__inline');
    this.arrows = this.el.nativeElement.querySelectorAll('.arrow');
    setTimeout(
      () => {
        this.detectWidth();
        this.onScroll();
        this.checkArrows();
        this.bindListeners();
      },
      100);
  }

  ngOnDestroy() {
    this.destroyListeners();
  }
  ngOnChanges() {
    setTimeout(
      () => {
        this.detectWidth();
        this.onScroll();
        this.checkArrows();
      },
      100);
  }
}
