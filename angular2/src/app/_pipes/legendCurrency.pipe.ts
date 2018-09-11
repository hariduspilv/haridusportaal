import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'legendCurrency'
})

export class LegendCurrencyPipe implements PipeTransform {

  transform(value: any, valueType: any): any {
    if( value == "0" ){ return value; }

    value = parseInt(value)/1000000;
    value = parseInt( value );

    /*
    if( valueType == "min" ){ 
      value+=1;
    }
    */
    return value;

  }

}
