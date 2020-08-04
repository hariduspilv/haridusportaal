import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'legendCurrency',
})

export class LegendCurrencyPipe implements PipeTransform {

  transform(value: number, valueType: any): any {
    if (value === 0) { return value; }
    let output:any = '';
    if (value > 999999) {
      // millions
      const val = value / 1000000;
      output = val.toFixed(1).replace('.0', '');
      output = `${output} mln`;
    }else {
      // thousands
      const val = value / 1000;
      output = val.toFixed(0);
      output = `${output} tuh`;
    }
    return output;
  }
}
