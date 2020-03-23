import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { fromEvent, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'scrollableContent',
  templateUrl: 'scrollableContent.template.html',
  styleUrls: ['./scrollableContent.styles.scss'],
})

export class ScrollableContentComponent implements OnInit, OnChanges, OnDestroy {

  public scrollRunner: any;
  public scrollDirection: number = 0;
  @Input() public changed: any;
  @Input() public scrollParentClass = 'app-content';
  public scrollListener: Subscription;
  private debounce: any;
  private wrapper: HTMLElement;
  private inline: HTMLElement;
  private scroller: HTMLElement;
  private arrows: NodeList;
  private arrowsPositionDebounce: any = false;
  private scrollParent: HTMLElement;
  private destroy$: Subject<boolean> = new Subject<boolean>();
  private scrollable = false;
  private checkedScrollable = false;
  private scrollLeft = false;
  private checkedScrollLeft = false;
  private scrollRight = false;
  private checkedScrollRight = false;

  constructor(
    private el: ElementRef,
  ) {
  }

  get isScrollable() {
    const el = this.el.nativeElement.querySelector('div.scrollable__scroller');
    const newVal = !el ? false : el.scrollWidth > el.clientWidth;
    if (newVal !== this.scrollable && !this.checkedScrollable) {
      this.checkedScrollable = true;
      setTimeout(
        () => {
          this.scrollable = newVal;
          this.checkedScrollable = false;
        },
        100);
    }
    return this.scrollable;
  }

  get canScrollLeft() {
    const el = this.el.nativeElement.querySelector('div.scrollable__scroller');
    const newVal = !el ? false : el.scrollLeft > 0;
    if (newVal !== this.scrollLeft && !this.checkedScrollLeft) {
      this.checkedScrollLeft = true;
      setTimeout(
        () => {
          this.scrollLeft = newVal;
          this.checkedScrollLeft = false;
        },
        100);
    }
    return this.scrollLeft;
  }

  get canScrollRight() {
    const el = this.el.nativeElement.querySelector('div.scrollable__scroller');
    const newVal = !el ? false : Math.ceil(el.scrollLeft) < el.scrollWidth - el.clientWidth - 1;
    if (newVal !== this.scrollRight && !this.checkedScrollRight) {
      this.checkedScrollRight = true;
      setTimeout(
        () => {
          this.scrollRight = newVal;
          this.checkedScrollRight = false;
        },
        100);
    }
    return this.scrollRight;
  }

  public onScroll() {
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

  public onMouseUp(event) {
    if (this.scrollRunner) {
      clearInterval(this.scrollRunner);
      this.scrollRunner = false;
    }
  }

  public checkArrows(): void {
    this.arrows.forEach((item: HTMLElement) => {
      item.style.position = 'absolute';
    });
  }

  public scroll(direction: number = 1): void {

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

  public bindListeners() {
    this.scrollListener = fromEvent(this.scrollParent, 'scroll').pipe(
      takeUntil(this.destroy$),
    ).subscribe((e) => {
      this.onScroll();
    });
  }

  public getScrollParent() {
    let scrollParent = this.el.nativeElement;
    let parentFound = false;

    while (!parentFound) {
      scrollParent = scrollParent.parentElement;
      if (!scrollParent || scrollParent.className.split(' ').includes(this.scrollParentClass)) {
        parentFound = true;
      }
    }

    if (!scrollParent) {
      scrollParent = window;
    }

    this.scrollParent = scrollParent;
  }

  public ngOnInit() {
    this.wrapper = this.el.nativeElement.querySelector('.scrollable__wrapper');
    this.scroller = this.el.nativeElement.querySelector('.scrollable__scroller');
    this.inline = this.el.nativeElement.querySelector('.scrollable__inline');
    this.arrows = this.el.nativeElement.querySelectorAll('.arrow');
    this.getScrollParent();
    setTimeout(
      () => {
        this.onScroll();
        this.checkArrows();
        this.bindListeners();
      },
      100);
  }

  public ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  public ngOnChanges() {
    setTimeout(
      () => {
        this.onScroll();
        // this.checkArrows();
      },
      100);
  }

  private centerArrows(): void {
    const wrapperHeight = this.wrapper.offsetHeight;
    this.arrows.forEach((item: HTMLElement) => {
      const el: HTMLElement = item.querySelector('icon');
      el.style.transform = `translateY(${wrapperHeight / 2}px)`;
    });
  }

  private positionArrows(): void {
    const wrapperTop = this.wrapper.offsetTop;
    const windowHeight = window.innerHeight;
    const wrapperHeight = this.wrapper.offsetHeight;
    const scrollTop = this.scrollParent.scrollTop;
    let top = (windowHeight / 2);

    if (scrollTop - wrapperTop + (windowHeight / 2) > wrapperHeight - (windowHeight / 2)) {
      top = wrapperHeight - (windowHeight / 2);
    } else if (wrapperTop < scrollTop) {
      top += scrollTop - wrapperTop;
    }

    this.arrows.forEach((item: HTMLElement) => {
      const el: HTMLElement = item.querySelector('icon');
      el.style.transform = `translateY(${top}px)`;
    });
  }
}
