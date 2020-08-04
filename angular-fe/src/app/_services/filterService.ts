import { Router, ActivatedRoute } from '@angular/router';
import * as _moment from 'moment';
import { Injectable } from '@angular/core';
const moment = _moment;

export const DATEPICKER_FORMAT = {
  parse: {
    dateInput: 'DD-MM-YYYY',
  },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Injectable()
export class FiltersService {

  filterFormItems: any = {};

  maxDate: any;
  absMaxDate: any = moment('01-01-2099', 'DD-MM-YYYY');
  minDate: any;
  absMinDate: any = moment('01-01-2000', 'DD-MM-YYYY');

  filterFull:any;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
  ) {

  }

  /**
   * Check if field is valid or not
   * @param id - field ID
   * @returns boolean
   */
  checkValidity(id) {
    const classes = document.getElementById(id).classList;
    return classes.contains('ng-invalid') && !classes.contains('ng-untouched');
  }

  /**
   * Sets min and max dates
   */
  dateminmax() {
    let minDate = this.filterFormItems.dateFrom;
    let maxDate = this.filterFormItems.dateTo;

    if (!moment(minDate, 'DD-MM-YYYY').isValid()) {
      minDate = moment('01-01-2000', 'DD-MM-YYYY');
    }
    if (!moment(maxDate, 'DD-MM-YYYY').isValid()) {
      maxDate = moment('01-01-2099', 'DD-MM-YYYY');
    }

    this.minDate = minDate;
    this.maxDate = maxDate;

  }

  /**
   * Parse filter date
   * @param dateString - VALID string of date
   * @returns parsed date eq. 20.02.2020
   */
  filterParseDate(dateString: string) {
    const tmpDate = new Date(dateString);
    const year = tmpDate.getFullYear();
    let month:any = tmpDate.getMonth() + 1;
    let day:any = tmpDate.getDate();

    if (month < 10) {
      month = `0${month}`;
    }

    if (day < 10) {
      day = `0${day}`;
    }

    return `${day}-${month}-${year}`;
  }

  /**
   * Parse filter values
   * @param params - filter params object
   */
  filterRetrieveParams(params:object) {

    for (const i in params) {

      if (i.match('date')) {
        this.filterFormItems[i] = _moment(params[i], 'DD-MM-YYYY');
      } else if (i === 'tags' || i === 'types') {
        // skip it and leave it to tags code to retrieve it
      } else {
        this.filterFormItems[i] = params[i];
      }
    }

    for (const i in this.filterFormItems) {
      if (!params[i]) {
        this.filterFormItems[i] = '';
      }
    }
  }

  /**
   * Clears filter field
   * @param name - string
   */
  clearField(name:any) {
    this.filterFormItems[name] = '';
  }

  /**
   * Submit filters
   * @param [$event]
   */
  filterSubmit($event:any = false) {

  }

}
