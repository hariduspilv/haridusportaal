import { Router, ActivatedRoute } from '@angular/router';
import * as _moment from 'moment';
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

  checkValidity(id) {
    const classes = document.getElementById(id).classList;
    return classes.contains('ng-invalid') && !classes.contains('ng-untouched');
  }

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

  filterParseDate(dateString: string) {
    let tmpDate = new Date(dateString);
    let year = tmpDate.getFullYear();
    let month:any = tmpDate.getMonth() + 1;
    let day:any = tmpDate.getDate();

    if (month < 10) {
      month = '0'+ month;
    }

    if (day < 10) {
      day = '0'+ day;
    }

    return day +'-'+ month + "-" + year;
  }

  filterRetrieveParams(params:object) {

    for (var i in params) {

      if (i.match('date')) {
        this.filterFormItems[i] = _moment(params[i], 'DD-MM-YYYY');
      }
      else if (i == 'tags' || i == 'types' ) {
        // skip it and leave it to tags code to retrieve it
      }
      else {
        this.filterFormItems[i] = params[i];
      }
    }

    for (let i in this.filterFormItems) {
      if (!params[i]) {
        this.filterFormItems[i] = '';
      }
    }
  }

  clearField(name:any) {
    this.filterFormItems[name] = '';
  }
  filterSubmit($event:any = false) {


  }

}
