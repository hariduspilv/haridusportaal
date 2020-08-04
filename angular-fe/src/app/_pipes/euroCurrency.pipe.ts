import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currency',
})

export class EuroCurrencyPipe implements PipeTransform {

  transform(value: any): any {
    if (!value) {
      return '0 €';
    }
    return `${Number(value).toLocaleString('en-uk', { minimumFractionDigits: 0 })
      .replace(/,/g, ' ')} €`;
  }
}
