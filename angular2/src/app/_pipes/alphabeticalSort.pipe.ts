import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'alphabeticalSort' })

export class alphabeticalSort implements PipeTransform {
  
  transform(arr: any[], field: string){
    if (arr && arr.length){
      return arr.sort((a, b) => {
        let first = a[field].toLowerCase();
        let second = b[field].toLowerCase();
        if (first < second) return -1;
        if (first > second) return 1;
        return 0;
      });
    }
  }
}