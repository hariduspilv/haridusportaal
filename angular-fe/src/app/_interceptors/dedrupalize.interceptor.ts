/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import {
	HttpRequest,
	HttpHandler,
	HttpEvent,
	HttpInterceptor,
	HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DedrupalizeInterceptor implements HttpInterceptor {
	intercept(
		request: HttpRequest<unknown>,
		next: HttpHandler
	): Observable<HttpEvent<any>> {
		return next.handle(request).pipe(
			map((event: HttpEvent<any>) => {
				if (event instanceof HttpResponse) {
					if (event.url.includes('/api') && event.body && !event.body.data) {
						const parsed = this.recurseObject(event.body);
						return event.clone({
							body: parsed,
						});
					}
				}
				return event;
			})
		);
	}

	private recurseObject(input: unknown) {
		if (!input || typeof input !== 'object') {
			return input;
		}

		if (Array.isArray(input)) {
			return input.map((entry) => this.recurseObject(entry));
		}

		// Convert ID-keyed PHP "arrays" into JavaScript arrays
		// `{ 1234: {...}, 5678: {...} }` -> `[{...}, {...}]`
		const objectKeys = Object.keys(input);
		if (objectKeys.every((key) => !isNaN(Number(key)))) {
			return this.recurseObject(Object.values(input));
		}

		return objectKeys.reduce(
			(output, key) => ({
				...output,
				[key]: this.recurseObject(input[key]),
			}),
			{}
		);
	}
}
