import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monthsToYears'
})

export class MonthsToYearsPipe implements PipeTransform {

  transform(value: number): any {
    const monthOverflow = value % 12;
    const years = Math.floor(value / 12);
    if (monthOverflow === 1 && years === 1) {
      return `${years} aasta ${monthOverflow} kuu`;
    }
    if (monthOverflow === 1 && years > 1) {
      return `${years} aastat ${monthOverflow} kuu`;
    }
    if (monthOverflow > 1 && years === 1) {
      return `${years} aasta ${monthOverflow} kuud`;
    }
    if (monthOverflow > 1 && years > 1) {
      return `${years} aastat ${monthOverflow} kuud`;
    }
    if (monthOverflow === 0 && years > 1) {
      return `${years} aastat`;
    }
    if (monthOverflow > 0 && years === 0) {
      return `${monthOverflow} kuud`;
    }
    return `${years} aasta`;
  }
}
