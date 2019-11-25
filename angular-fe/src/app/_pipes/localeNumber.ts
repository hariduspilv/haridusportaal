import { Pipe, PipeTransform, Inject, LOCALE_ID } from '@angular/core';

@Pipe({
  name: 'localeNumber',
})

export class LocaleNumberPipe implements PipeTransform {
  public locale = 'et-EE';
  // in storybook gives wrong value, use later :)
  // constructor(@Inject(LOCALE_ID) public locale: string) {}

  transform(value: string): any {
    const newValue = value.includes(',') ? value.replace(/,/g, '.') : value;
    return parseFloat(newValue).toLocaleString(this.locale);
  }

}
