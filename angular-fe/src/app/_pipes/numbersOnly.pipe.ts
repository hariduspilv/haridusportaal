import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numbersOnly',
})

export class NumbersOnly implements PipeTransform {

  transform(value: string): string {
    return 'asd';
  }

}
