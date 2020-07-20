import { Directive, OnInit, HostListener, ElementRef, Input } from '@angular/core';
import { RippleService } from '@app/_services';

@Directive({
  selector: '[ripple]',
})

export class RippleDirective implements OnInit{

  @Input() ripple: string = 'light';
  @HostListener('mousedown', ['$event']) animateRipple($event) {
    this.rippleEffect.animate($event, this.ripple);
  }

  constructor(
    private el: ElementRef,
    private rippleEffect: RippleService,
  ) {}

  addStyles() {
    const el = this.el.nativeElement;

    if (getComputedStyle(el).position !== 'absolute') {
      el.style.position = 'relative';
    }

    if (getComputedStyle(el).display === 'inline') {
      el.style.display = 'inline-block';
    }

    el.style.overflow = 'hidden';
    el.style.cursor = 'pointer';

  }

  ngOnInit() {

    this.addStyles();

  }
}
