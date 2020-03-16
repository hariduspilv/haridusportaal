import { Directive, OnInit, ElementRef, HostBinding } from '@angular/core';
import { AnalyticsService } from '@app/_services';

@Directive({
  selector: '[cornerLogo]',
})
export class CornerLogoDirective implements OnInit{

  public eventScrollListener: EventListener;
  public isHidden: boolean = false;
  @HostBinding('class') get hostClasses(): string {
    return `corner-logo ${this.isHidden ? 'hidden' : ''}`;
  }
  constructor(
    private elementRef: ElementRef,
  ) {}

  public listenerEvent(): void {
    if (document.querySelector('.app-content').scrollTop > 10) {
      if (!this.isHidden) {
        this.isHidden = true;
      }
    } else {
      this.isHidden = false;
    }
  }

  ngOnInit(): void {
    document.querySelector('.app-content')
    .addEventListener('scroll', this.eventScrollListener = () => this.listenerEvent());
  }
  ngOnDestroy(): void {
    document.querySelector('.app-content').removeEventListener('scroll', this.eventScrollListener);
  }
}
