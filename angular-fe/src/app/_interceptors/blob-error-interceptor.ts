import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * https://github.com/angular/angular/issues/19888
 * Handles errors of type Blob requests, because angular returns the error in Blob, not in text...
 */

@Injectable({
  providedIn: 'root',
})
export class BlobErrorHttpInterceptor implements HttpInterceptor {
  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse && err.error instanceof Blob && err.error.type === 'application/json') {
          return new Promise<any>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e: Event) => {
              try {
                const errmsg = JSON.parse((e.target as any).result);
                reject(new HttpErrorResponse({
                  error: errmsg,
                  headers: err.headers,
                  status: err.status,
                  statusText: err.statusText,
                  url: err.url,
                }));
              } catch (error) {
                reject(err);
              }
            };
            reader.onerror = () => {
              reject(err);
            };
            reader.readAsText(err.error);
          });
        }
        return throwError(err);
      }),
    );
  }
}
