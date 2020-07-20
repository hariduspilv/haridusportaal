import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'urlDecode',
})

export class UrlDecodePipe implements PipeTransform {

  transform(value: any): any {

    return decodeURI(value);

  }

}
