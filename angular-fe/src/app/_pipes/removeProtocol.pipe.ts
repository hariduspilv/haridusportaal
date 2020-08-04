import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeProtocol',
})

export class RemoveProtocolPipe implements PipeTransform {

  transform(value: any): any {

    if (value === undefined) {
      return '';
    }
    return decodeURIComponent(value.replace(/.*\s*:\/\/\s*/, ''));

  }

}
