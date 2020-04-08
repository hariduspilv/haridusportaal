import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ellipsis',
})

export class EllipsisPipe implements PipeTransform {

  transform(value: any, length: number = 100): any {

    if (value.length <= length) {
      return value;
    }

    const strAry = value.split(' ');

    let retLen = strAry[0].length;

    let i = 0;

    for (i = 1; i < strAry.length; i++) {
      if (retLen === length || retLen + strAry[i].length + 1 > length) {
        break;
      }

      retLen += strAry[i].length + 1;
    }

    let str = strAry.slice(0, i).join(' ');
    if (str.slice(-1) === '.') {
      str = str.slice(0, str.length - 1);
    }

    return `${str}...`;

  }

}
