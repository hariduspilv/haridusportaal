import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeProtocol'
})

export class RemoveProtocolPipe implements PipeTransform {

  transform(value: any): any {
    
    return value.replace(/.*\s*:\/\/\s*/, "");

  }

}
