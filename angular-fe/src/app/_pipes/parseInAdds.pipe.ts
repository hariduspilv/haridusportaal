import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'parseInAdds',
})

export class ParseInAddsPipe implements PipeTransform {

  transform(value: any): any {

    if (typeof value === 'object') {
      return value.addressHumanReadable || '';
    }
    return decodeURI(value || '');

  }

}
