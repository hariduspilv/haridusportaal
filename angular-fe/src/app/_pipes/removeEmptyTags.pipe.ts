import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeEmptyTags',
})

export class RemoveEmptyTagsPipe implements PipeTransform {

  constructor(
  ) {}

  transform(value: string): string {
    return value.replace(/<\b(?!td|th)\b.+>(\s?|\&nbsp\;)<\/.+>/gmi, '');
  }

}
