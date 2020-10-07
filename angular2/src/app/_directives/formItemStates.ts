import { Directive, OnInit, ElementRef, Renderer2, HostListener } from '@angular/core';

// Directive decorator
@Directive({ selector: '[formItemStates]' })

// Directive class
export class FormItemStatesDirective {

  private el: ElementRef;

  private focusClassName = 'focus';
  private filledClassName = 'filled';

  constructor(
    private _el: ElementRef,
    private renderer: Renderer2
  ) {

  }
  @HostListener('focus', ['$event']) onFocus(e) {
    this.renderer.addClass( this._el.nativeElement.parentNode, this.focusClassName );
    return;
  }

  @HostListener('blur', ['$event']) onBlur(e) {
    this.renderer.addClass( this._el.nativeElement.parentNode, this.focusClassName, false );
    return;
  }

  @HostListener('change', ['$event']) onChange(e) {
    let set = true;
    if ( this._el.nativeElement.value === '' ) {
      set = false;
    }
    this.renderer.addClass( this._el.nativeElement.parentNode, this.filledClassName, set );
    return;
  }


}
