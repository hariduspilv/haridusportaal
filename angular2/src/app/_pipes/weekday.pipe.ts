import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'weekday'
})

export class WeekDayPipe implements PipeTransform {
    transform(value: any, trim:any): any {

			let days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

			if( trim == "unix"){
				let tmpDate = new Date(value);

				return days[tmpDate.getDay()];
				
			}
			let output = days[value];

			
			if( trim == "short" ){
				output = output.substring(0, 1);
			}

			return output;
    }
}