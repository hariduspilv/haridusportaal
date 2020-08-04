import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from './translate.service';

@Pipe({
  name: 'translate',
})

export class TranslatePipe implements PipeTransform {

  constructor(
    private translate: TranslateService,
  ) {}
  transform(value: any): any {
    return this.translate.get(value);
  }

}
