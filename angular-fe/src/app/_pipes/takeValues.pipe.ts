import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'values',
})
export class TakeValues implements PipeTransform {
	transform(entry: Record<string, unknown[]>): unknown[] {
		return Object.values(entry);
	}
}
