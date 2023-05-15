import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'firstValue',
})
export class TakeFirstValue implements PipeTransform {
	transform(entry: Record<string, string>): string {
		return Object.values(entry)[0];
	}
}
