import { Directive, ElementRef } from '@angular/core';

@Directive({
	selector: 'img'
})
export class LazyImgDirective {
	private static supports = ('loading' in HTMLImageElement.prototype);

	constructor({ nativeElement }: ElementRef<HTMLImageElement>) {
		const currentPath = window.location.pathname;
		const isOnMainPage = currentPath === '/';

		if (LazyImgDirective.supports && !isOnMainPage) {
			nativeElement.setAttribute('loading', 'lazy');
		}
	}
}
