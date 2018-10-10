import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currency'
})

export class EuroCurrencyPipe implements PipeTransform {

  transform(value: any): any {
    
    value = Number(value).toLocaleString("en-uk", {minimumFractionDigits: 0}).replace(/,/g, " ")+" €";
    return value;

  }

}
