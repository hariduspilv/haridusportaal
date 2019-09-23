import {
  Component,
  OnInit,
  ElementRef,
  OnChanges,
  HostListener,
  Input,
} from '@angular/core';

@Component({
  selector: 'scrollableContent',
  templateUrl: 'scrollableContent.template.html',
  styleUrls: ['./scrollableContent.styles.scss'],
})

export class ScrollableContentComponent implements OnInit, OnChanges{

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

  @HostListener('window:scroll', ['$event'])
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

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event) {
    clearInterval(this.scrollRunner);
    this.scrollDirection = 0;
  }

  @HostListener('window:resize', ['$event'])
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

  private detectWidth(): void {
    // this.scroller.style.width = '9999px';

    const inline = this.el.nativeElement.querySelector('.scrollable__inline');
    const inlineWidth = inline.offsetWidth;
    inline.style.width = `${inlineWidth}px`;
    this.scroller.style.width = '100%';
    const mainWidth = this.el.nativeElement.offsetWidth;
    this.isScrollable = mainWidth < inlineWidth;
  }

  public checkArrows(): void {
    this.canScrollLeft = this.scroller.scrollLeft <= 0 ? false : true;
    const maxScroll = this.scroller.scrollLeft + this.scroller.offsetWidth;
    this.canScrollRight = this.scroller.scrollWidth <= maxScroll ? false : true;
  }

  public scroll(direction:number = 1): void {

    this.scrollDirection = direction;

    if (direction === 2) {
      clearInterval(this.scrollRunner);
    } else {
      clearInterval(this.scrollRunner);
      this.scrollRunner = setInterval(
        () => {
          const scroller = this.el.nativeElement.querySelector('.scrollable__scroller');
          let scrollLeft = scroller.scrollLeft;
          const step = 20;

          scrollLeft += direction * step;
          scroller.scrollLeft = scrollLeft;
        },
        30);
    }
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
      },
      0);
  }

  ngOnChanges() {
    setTimeout(
      () => {
        this.detectWidth();
      },
      0);
  }
}
