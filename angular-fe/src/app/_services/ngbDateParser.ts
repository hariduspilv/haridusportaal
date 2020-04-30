import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Injectable } from '@angular/core';

@Injectable()
export class NgbDateCustomParserFormatter extends NgbDateParserFormatter {

  /**
   * Change input value to Integer
   * @param value - string
   * @returns - parsed value as integer
   */
  toInteger(value: any) {
    return parseInt(value, 0);
  }

  /**
   * Check if value is number
   * @param value - any
   * @returns - boolean
   */
  isNumber(value: any) {
    return typeof value === 'number';
  }

  /**
   * Add 0 in front of number IF the number is below 10
   * @param value - number
   * @returns - string;
   */
  padNumber(value: number) {
    return value < 10 ? `0${value}` : value;
  }

  /**
   * Parses date string to object
   * @param value - string
   * @returns - date object { day, month, year }
   */
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

  /**
   * Format date object to string
   * @param date - date object {day, month, year}
   * @returns - date string dd.mm.yyyy
   */
  format(date: NgbDateStruct): string {
    const output = date ? `
      ${this.isNumber(date.day) ? this.padNumber(date.day) : ''}.
      ${this.isNumber(date.month) ? this.padNumber(date.month) : ''}.
      ${date.year}` : '';
    return output.replace(/ /g, '');
  }
}
