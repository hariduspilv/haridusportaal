import { Pipe, PipeTransform, Inject, LOCALE_ID } from '@angular/core';

@Pipe({
  name: 'localeNumber'
})

export class LocaleNumberPipe implements PipeTransform {
  constructor(
    @Inject(LOCALE_ID) public locale: string
  ) { }

  transform(value: string): any {

    return parseInt(value).toLocaleString(this.locale);

  }

}
