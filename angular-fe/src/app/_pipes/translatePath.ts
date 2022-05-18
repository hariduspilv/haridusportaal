import { Pipe, PipeTransform } from '@angular/core';
import { translatePath } from "@app/_core/router-utility";

// NB! path must begin with '/'

@Pipe({
	name: 'translatePath',
})
export class TranslatePath implements PipeTransform {
	transform(path: string): string {
		return path !== '' ? translatePath(path) : '';
	}
}
