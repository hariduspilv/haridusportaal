import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@app/_modules/translate/translate.service';

@Pipe({
  name: 'monthsToYears',
})

export class MonthsToYearsPipe implements PipeTransform {

  constructor(
    private translate: TranslateService,
  ) {}

  transform(value: number): any {
    const monthOverflow = value % 12;
    const years = Math.floor(value / 12);
    if (monthOverflow === 1 && years === 1) {
      return `${years} ${this.translate.get('time.duration_year_singular')}
      ${monthOverflow} ${this.translate.get('time.duration_month_singular')}`;
    }
    if (monthOverflow > 1 && years === 1) {
      return `${years} ${this.translate.get('time.duration_year_singular')}
      ${monthOverflow} ${this.translate.get('time.duration_month_plural')}`;
    }
    if (monthOverflow > 1 && years > 1) {
      return `${years} ${this.translate.get('time.duration_year_plural')}
      ${monthOverflow} ${this.translate.get('time.duration_month_plural')}`;
    }
    if (monthOverflow === 0 && years > 1) {
      return `${years} ${this.translate.get('time.duration_year_plural')}`;
    }
    if (monthOverflow > 0 && years === 0) {
      return `${monthOverflow} ${this.translate.get('time.duration_month_plural')}`;
    }
    return `${years} ${this.translate.get('time.duration_year_singular')}`;
  }

}
