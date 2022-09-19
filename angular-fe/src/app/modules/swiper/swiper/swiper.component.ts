import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import Swiper, { SwiperOptions } from 'swiper';
import { NavigationOptions } from 'swiper/types/modules/navigation';
import { PaginationOptions } from 'swiper/types/modules/pagination';

@Component({
  selector: 'htm-swiper',
  templateUrl: './swiper.component.html',
  styleUrls: ['./swiper.component.scss']
})
export class HTMSwiperComponent implements AfterViewChecked, AfterViewInit, OnDestroy {
  @ViewChild('swiperComponent', { static: true }) private swiperComponent: ElementRef<HTMLDivElement>;
  @Input() config: SwiperOptions;
  /**
   * Find swiper paginator and navigation buttons inside this element.
   * Needed when using multiple swipers on one page, as the config will usually
   * resolve the last one on the page by selector.
   * 
   * Set to `false` if you're already providing elements instead of selectors.
   */
  @Input() resolveElements = true;

  public swiper: Swiper;

  private _wasInitialized = false;
  private _slideCount = 0;
  private _wrapper: HTMLDivElement;

  constructor(private _cdr: ChangeDetectorRef) {}

  public setup(): void {
    if (!this.swiper && this.swiperComponent) {
      this._wrapper = this.swiperComponent.nativeElement.querySelector('.swiper-wrapper');
      this._slideCount = this._wrapper.childElementCount;
      this._wasInitialized = true;

      if (this.resolveElements) {
        // Set correct pagination element
        const pagination = this.config.pagination as PaginationOptions;
        if (pagination?.el) {
          pagination.el = this.getSwiperDirectChild(pagination.el as string);
        }

        // Set correct navigation element
        const navigation = this.config.navigation as NavigationOptions;
        if (navigation?.nextEl && navigation?.prevEl) {
          navigation.nextEl = this.getSwiperDirectChild(navigation.nextEl as string);
          navigation.prevEl = this.getSwiperDirectChild(navigation.prevEl as string);
        }
      }
      
      this.swiper = new Swiper(this.swiperComponent.nativeElement, this.config);
      this._cdr.markForCheck();
    }
  }

  ngAfterViewChecked(): void {
    if (!this.swiperComponent || !this.swiper) {
      return;
    }

    if (
      this.swiperComponent &&
      this._slideCount !== this._wrapper.childElementCount
    ) {
      this._slideCount = this._wrapper.childElementCount;
      this.swiper.update();
    }
  }

  ngAfterViewInit(): void {
    if (!this._wasInitialized) {
      this.setup();
    }
  }

  ngOnDestroy(): void {
    if (this.swiper) {
      this.swiper.destroy(true, true);
    }
  }

  private getSwiperDirectChild(selector: string): HTMLElement {
    return this.swiperComponent.nativeElement.querySelector(selector);
  }
}
