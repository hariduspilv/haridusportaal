import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'titleCase'})

export class titleCasePipe implements PipeTransform {
  transform(input:string): string{
    if (!input) {
      return '';
    } else {
      return input.substr(0, 1).toUpperCase() + input.substr(1);
    }
  } 
}