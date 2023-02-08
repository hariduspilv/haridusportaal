import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localeOrderBy',
})
export class LocaleOrderByPipe implements PipeTransform {
  private collator = new Intl.Collator('et', {
    numeric: true,
    sensitivity: 'base',
  });

  private sort(value: Array<any>, property: string, order: number): Array<any> {
    return value.sort((a, b) => this.collator.compare(a[property], b[property]) * order);
  }

  public transform(value: Array<any>, field: string, direction: number = 1): Array<any> {
    if (!value) return [];
		if (direction === 0 || field == null) {
			return value;
    }
    return this.sort(value.slice(), field, direction);
  }
}
