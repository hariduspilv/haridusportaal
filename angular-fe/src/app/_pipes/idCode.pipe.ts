import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'idCode',
  pure: false,
})
export class IdCodePipe implements PipeTransform {

  transform(idCode: string): any {
    if (!idCode || !isNaN(<any>idCode.charAt(0)) && !isNaN(<any>idCode.charAt(1))) {
      return idCode;
    }
    return idCode.substring(2);
  }
}
