import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'legendCurrency'
})

export class LegendCurrencyPipe implements PipeTransform {

  transform(value: number, valueType: any): any {
    if( value == 0 ){ return value; }

    let output:any = '';

    //'school.investment_amount_million_short'
    if( value > 999999 ){
      //millions
      value = value / 1000000;
      output = value.toFixed(1).replace(".0", "");
      output = output + " mln";
    }else{
      //thousands
      value = value / 1000;
      output = value.toFixed(0);
      output = output + " tuh";
    }

    return output;

  }

}
