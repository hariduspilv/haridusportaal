import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize',
})

export class CapitalizePipe implements PipeTransform {

  transform(value: any): any {
    let output;
    if (typeof value !== 'string') {
      output = '';
    } else {
      output = value.charAt(0).toUpperCase() + value.slice(1);
    }
    return output;

  }

}