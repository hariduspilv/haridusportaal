import { ElementRef, Directive } from '@angular/core';

@Directive({
	selector: '[numberFormatter]',
})
export class numberFormatterDirective {
	
    constructor(
        public el: ElementRef) {

        this.el.nativeElement.onkeyup = () => {

            this.el.nativeElement.value = this.el.nativeElement.value.replace(/\D/g,'');
        }
	}
}