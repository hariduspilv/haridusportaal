import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Injectable } from '@angular/core';

@Injectable()
export class NgbDateCustomParserFormatter extends NgbDateParserFormatter {

  toInteger(value: any) {
    return parseInt(value, 0);
  }

  isNumber(value: any) {
    return typeof value === 'number';
  }

  padNumber(value: number) {
    return value < 10 ? `0${value}` : value;
  }

  parse(value: string): NgbDateStruct {
    let output = null;
    if (value) {
      const dateParts = value.trim().split('-');
      if (dateParts.length === 1 && this.isNumber(dateParts[0])) {
        output = { day: this.toInteger(dateParts[0]), month: null, year: null };
      }  if (dateParts.length === 2 && this.isNumber(dateParts[0]) && this.isNumber(dateParts[1])) {
        output = {
          day: this.toInteger(dateParts[0]),
          month: this.toInteger(dateParts[1]),
          year: null,
        };
      } else if (
        dateParts.length === 3 &&
        this.isNumber(dateParts[0]) &&
        this.isNumber(dateParts[1]) &&
        this.isNumber(dateParts[2])
      ) {
        output = {
          day: this.toInteger(dateParts[0]),
          month: this.toInteger(dateParts[1]),
          year: this.toInteger(dateParts[2]),
        };
      }
    }
    return output;
  }

  format(date: NgbDateStruct): string {
    const output = date ? `
      ${this.isNumber(date.day) ? this.padNumber(date.day) : ''}.
      ${this.isNumber(date.month) ? this.padNumber(date.month) : ''}.
      ${date.year}` : '';
    return output.replace(/ /g, '');
  }
}
