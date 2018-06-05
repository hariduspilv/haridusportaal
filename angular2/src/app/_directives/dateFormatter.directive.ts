import { ElementRef, Directive, Input, Output, EventEmitter, OnInit} from '@angular/core';
import * as moment from 'moment';

@Directive({
	selector: '[dateFormatter]',
})
export class DateFormatterDirective {
	
	constructor(public el: ElementRef) {
		
		this.el.nativeElement.onkeypress = (evt) => {
			
			var numChars = evt.target.value.length;
			
			if ((evt.which < 48 || evt.which > 57) && evt.which !== 13) {
				evt.preventDefault();
			}

			if (numChars === 2 || numChars === 5) {
				evt.preventDefault();				
				evt.target.value = evt.target.value + '/';
			}
		};
		
	}

}