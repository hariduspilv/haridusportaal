import { ElementRef, Directive, Input, Output, EventEmitter, OnInit} from '@angular/core';
import * as moment from 'moment';

@Directive({
	selector: '[dateFormatter]',
})
export class DateFormatterDirective {
	
	constructor(public el: ElementRef) {
		
		
		this.el.nativeElement.onkeydown = (evt) => {
			let value = evt.target.value;

			//value = value.replace(/[^0-9]/gi, "");

			let numChars = value.length;
			let outputValue = "";

			
			/*
			if( evt.which == 8 ){
				evt.preventDefault();
				outputValue = evt.target.value;

				if( outputValue.slice(-1) == "-" ){
					outputValue = outputValue.substring(0, outputValue.length-2);
				}else{
					outputValue = outputValue.substring(0, outputValue.length-1);
				}
				evt.target.value = outputValue;
			}*/

		};

		this.el.nativeElement.onblur = (evt) => {
			
			let value = evt.target.value;

			value = value.replace(/[^0-9]/gi, "");

			let numChars = value.length;

			let outputValue = "";

			if( evt.which == 8123 ){

			}else{
				outputValue = value.substr(0,2);

				if( parseInt( value.substr(0,2) ) > 31 ){ outputValue = "31"; }

				if( numChars >= 2 ){
					outputValue+="-";
				}

				outputValue+= parseInt( value.substr(2,2) ) > 12 ? "12" : value.substr(2,2);

				if( numChars >= 4 ){
					outputValue+="-";
				}

				let year = value.substr(4,4);
				if( year !== "" ){
					if( year.substr(0,1) !== "2" ){ year = "2"+year.substr(1,4);}
					if( year.substr(1,1) !== "0" && year.substr(1,1) !== ""){ year = "20"+year.substr(2,2);}
					outputValue+=year;
				}

				if( evt.which == 8 && outputValue.slice(-1) == "-" ){
					outputValue = outputValue.substring(0, outputValue.length-1);
				}
				evt.target.value = outputValue;	
			}
		};
		
	}

}