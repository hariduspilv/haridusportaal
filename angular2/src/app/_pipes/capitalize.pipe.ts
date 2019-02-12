import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize'
})

export class CapitalizePipe implements PipeTransform {

  transform(value: any, length: number = 100): any {

    return value.charAt(0).toUpperCase() + value.slice(1);;

  }

}
