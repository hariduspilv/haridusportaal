import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localeNumber',
})

export class LocaleNumberPipe implements PipeTransform {

  transform(value: string, locale: string) {
    const formattedNum = parseInt(value, 10).toLocaleString(locale);
    return formattedNum.replace(',', ' ');
  }
}
