import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { HttpService } from '@app/_services/httpService';
import { Jsonp } from '@angular/http';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, RoutesRecognized } from '@angular/router';
import { RootScopeService } from '@app/_services/rootScopeService';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmPopupDialog } from '@app/_components/dialogs/confirm.popup/confirm.popup.dialog';
import { TableService } from '@app/_services/tableService';
import { SettingsService } from '@app/_services/settings.service';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { throwError } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import * as _moment from 'moment';
const moment = _moment;
import { MAT_DATE_FORMATS } from '@angular/material';


const XJSON_DATEPICKER_FORMAT = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD.MM.YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  }
};
@Component({
  templateUrl: 'xjson.template.html',
  styleUrls: ['../xjson/xjson.styles.scss'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: XJSON_DATEPICKER_FORMAT },
  ]
})
export class XjsonComponent implements OnInit, OnDestroy {

  public view = 'document';

  public tableOverflown: any = {};
  public elemAtStart: any = {};
  public tableCountPerStep = 0;
  public tableIndexes = [];

  public objectKeys = Object.keys;
  public test: boolean;
  public queryStrings = {};
  public fileLoading = {};
  public formLoading = false;

  public lang: string;
  public form_name: string;
  public subscriptions: Subscription[] = [];
  public dialogRef: MatDialogRef<ConfirmPopupDialog>;
  public datepickerFocus = false;
  public acceptable_forms_list_restricted = true;
  public temporaryModel = {};
  public data;
  public edit_step = false;
  public empty_data = false;
  public acceptable_forms = [];
  public acceptable_forms_limit = 4;
  public opened_step;
  public max_step;
  public current_acceptable_activity: string[];
  public data_elements;
  public data_messages;
  public navigationLinks;
  public subButtons;
  public activityButtons;
  public error_alert = false;
  public error = {};
  public redirect_url;

  public autoCompleteContainer = {};
  public autocompleteDebouncer = {};
  public autocompleteSubscription = {};
  public autocompleteLoader = true;
  public addressFieldFocus = false;

  constructor(
    private translate: TranslateService,
    public dialog: MatDialog,
    private rootScope: RootScopeService,
    private http: HttpService,
    private _jsonp: Jsonp,
    private _formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private tableService: TableService,
    public settings: SettingsService
  ) { }

  pathWatcher() {
    const params = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.form_name = params['form_name'];
        this.lang = params['lang'];
      }
    );
    const strings = this.route.queryParams.subscribe(
      (strings: ActivatedRoute) => {
        this.test = (strings['test'] === 'true');
        if (strings['draft'] === 'true') { this.queryStrings['status'] = 'draft'; }
        if (strings['existing'] === 'true') { this.queryStrings['status'] = 'submitted'; }
        if (this.form_name && this.form_name.includes('MTSYS') && strings['educationalInstitutions_id']) { this.queryStrings['educationalInstitutions_id'] = strings['educationalInstitutions_id']; }
        if (strings['identifier'] !== undefined) { this.queryStrings['id'] = Number(strings['identifier']); }
      }
    );

    this.subscriptions = [...this.subscriptions, params];
    this.subscriptions = [...this.subscriptions, strings];
  }

  changeView(key) {
    this.view = key;
  }

  fillAddressFieldsTemporaryModel(data_elements) {
    Object.keys(data_elements).forEach(element => {

      if (data_elements[element].type === 'address' && data_elements[element].value) {
        if (typeof data_elements[element].value === 'object') {
          if (data_elements[element].value.addressHumanReadable) {
            this.autoCompleteContainer[element] = [data_elements[element].value];
            this.temporaryModel[element] = JSON.parse(JSON.stringify(data_elements[element].value.addressHumanReadable));

          } else {
            data_elements[element].value = null;
          }
        } else if (typeof data_elements[element].value === 'string') {
          this.temporaryModel[element] = JSON.parse(JSON.stringify(data_elements[element].value));
          this.addressAutocomplete(data_elements[element].value, 0, element, true);
        }
      } else if (data_elements[element].type === 'table') {
        Object.keys(data_elements[element].table_columns).forEach(tableElement => {
          if (data_elements[element].table_columns[tableElement].type === 'address') {
            if (Array.isArray(data_elements[element].value)) {
              data_elements[element].value.forEach((rowValue, row) => {

                if (rowValue[tableElement].adsOid) {
                  const addressValue = {
                    [row]: rowValue[tableElement].addressHumanReadable
                  };
                  if (!this.temporaryModel[element] && !this.autoCompleteContainer[element]) {
                    this.temporaryModel[element] = {
                      [tableElement]: addressValue
                    };
                    this.autoCompleteContainer[element] = {
                      [tableElement]: addressValue
                    };
                  } else {
                    this.autoCompleteContainer[element][tableElement] = { ...this.autoCompleteContainer[element][tableElement], ...addressValue };
                    this.temporaryModel[element][tableElement] = { ...this.temporaryModel[element][tableElement], ...addressValue };
                  }
                }
              });
            }
          }
        });
      }
    });
    console.log(this.temporaryModel);
  }

  validateInAdsField(element) {
    if (this.addressFieldFocus === false) {
      this.addressAutocompleteSelectionValidation(element);
    }
  }

  validateInAdsFieldTable(element, column, row) {
    if (this.addressFieldFocus === false) {
      this.addressAutocompleteSelectionValidationTable(element, column, row);
    }
  }

  addressAutocompleteSelectionValidation(element) {

    if (this.autoCompleteContainer[element] === undefined) {
      return this.temporaryModel[element] = null;
    }

    const match = this.autoCompleteContainer[element].find(address => {
      return address.addressHumanReadable === this.temporaryModel[element];
    });

    if (!match) {
      this.autoCompleteContainer[element] = null;
      this.temporaryModel[element] = null;
      this.data_elements[element].value = null;
    } else {
      this.data_elements[element].value = this.inAdsFormatValue(match);
    }

  }

  addressAutocompleteSelectionValidationTable(element, column, row) {

    if (this.autoCompleteContainer[element][column][row] === undefined) {
      return this.temporaryModel[element][column][row] = null;
    }

    const match = this.autoCompleteContainer[element][column][row].find(address => {
      return address.addressHumanReadable === this.temporaryModel[element][column][row];
    });

    if (!match) {
      this.autoCompleteContainer[element][column][row] = null;
      this.temporaryModel[element][column][row] = null;
      this.data_elements[element].value[row][column] = null;
    } else {
      this.data_elements[element].value[row][column] = this.inAdsFormatValue(match);
    }
  }

  addressAutocomplete(searchText: string, debounceTime: number = 300, element, autoselectOnMatch: boolean = false, col: string = '', row: number = 0, table: boolean = false) {

    if (searchText.length < 3) { return; }

    const index = table ? Array.prototype.join.call(element, col, row) : element;

    if (this.autocompleteDebouncer[index]) { clearTimeout(this.autocompleteDebouncer[index]); }

    if (this.autocompleteSubscription[index] !== undefined) { this.autocompleteSubscription[index].unsubscribe(); }

    const _this = this;

    const limit = table ? this.data_elements[element].value[row][col] && this.data_elements[element].value[row][col].results != null ? this.data_elements[element].value[row][col].results : 10 : this.data_elements[element].results || 10;
    const ihist = table ? this.data_elements[element].value[row][col] && this.data_elements[element].value[row][col].ihist != null ? this.data_elements[element].value[row][col].ihist : 0 : this.data_elements[element].ihist || 0;
    const apartment = table ? this.data_elements[element].value[row][col] && this.data_elements[element].value[row][col].appartment != null ? this.data_elements[element].value[row][col].appartment : 0 : this.data_elements[element].appartment || 0;

    this.autocompleteDebouncer[index] = setTimeout(function () {
      _this.autocompleteLoader = true;
      const url = 'http://inaadress.maaamet.ee/inaadress/gazetteer?ihist=' + ihist + '&appartment=' + apartment + '&address=' + searchText + '&results=' + limit + '&callback=JSONP_CALLBACK';
      const jsonp = _this._jsonp.get(url).map(function (res) {
        return res.json() || {};
      }).catch(function (error: any) { return throwError(error); });

      _this.autocompleteSubscription[index] = jsonp.subscribe(data => {
        if (data['error']) { _this.errorHandler('Something went wrong with In-ADS request'); }

        if (!table) {
          _this.autocompleteLoader = false;
          _this.autoCompleteContainer[element] = data['addresses'] || [];

          _this.autoCompleteContainer[element] = _this.autoCompleteContainer[element].filter(address => (address.kood6 !== '0000' || address.kood7 !== '0000'));

          _this.autoCompleteContainer[element].forEach(address => {
            if (address.kort_nr) {
              address.addressHumanReadable = address.pikkaadress + '-' + address.kort_nr;
            } else {
              address.addressHumanReadable = address.pikkaadress;
            }
          });
        } else {
          _this.autocompleteLoader = false;

          _this.autoCompleteContainer[element] = {
            [col]: {
              [row]: data['addresses'] || []
            }
          };

          _this.autoCompleteContainer[element][col][row] = _this.autoCompleteContainer[element][col][row].filter(address => (address.kood6 !== '0000' || address.kood7 !== '0000'));

          _this.autoCompleteContainer[element][col][row].forEach(address => {
            if (address.kort_nr) {
              address.addressHumanReadable = address.pikkaadress + '-' + address.kort_nr;
            } else {
              address.addressHumanReadable = address.pikkaadress;
            }
          });
        }

        if (autoselectOnMatch === true) {
          _this.addressAutocompleteSelectionValidationTable(element, col, row);
        }

        _this.autocompleteSubscription[index].unsubscribe();
      });

    }, debounceTime);
  }

  inAdsFormatValue(address) {
    if (address.apartment !== undefined) { return address; }

    return {
      'adsId': address.adr_id,
      'adsOid': address.ads_oid,
      'addressCoded': address.koodaadress,
      'county': address.maakond,
      'countyEHAK': address.ehakmk,
      'localGovernment': address.omavalitsus,
      'localGovernmentEHAK': address.ehakov,
      'settlementUnit': address.asustusyksus,
      'settlementUnitEHAK': address.ehak,
      'address': address.aadresstekst,
      'apartment': address.kort_nr,
      'addressHumanReadable': address.addressHumanReadable
    };
  }

  scrollPositionController() {
    const _opened_step = this.opened_step;
    if (_opened_step) {
      if (document.getElementById('stepNavigation')) {
        setTimeout(function () {
          const step_navigation_container = document.getElementById('stepNavigation');
          const opened_step_element = document.getElementById(_opened_step);
          const parent_center = step_navigation_container.offsetWidth / 2;
          const button_center = opened_step_element.offsetWidth / 2;
          const position_left = (step_navigation_container.offsetLeft - opened_step_element.offsetLeft + parent_center - button_center) * -1;
          if (window.pageYOffset > 0) {
            try {
              window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
            } catch (e) {
              window.scrollTo(0, 0);
            }
            navScroller();
          } else {
            navScroller();
          }
          function navScroller() {
            try {
              step_navigation_container.scrollTo({ left: position_left, behavior: 'smooth' });
            } catch (e) {
              step_navigation_container.scrollTo(position_left, 0);
            }
          }
        }, 0);
      }
    }
  }

  setDatepickerValue(event, element, rowindex, col) {
    if (this.datepickerFocus === false) {
      if (!(event instanceof FocusEvent)) {
        const dateval = event.value.format('L');
        rowindex === undefined || col === undefined
          ? this.data_elements[element].value = dateval
          : this.data_elements[element].value[rowindex][col] = dateval;
      }
    }
  }

  getDatepickerValue(element, rowindex, col) {
    const date = rowindex === undefined || col === undefined
      ? this.data_elements[element].value
      : this.data_elements[element].value[rowindex][col];

    if (date) {
      return moment((String(date).split('.')).reverse().join('-'));
    } else {
      return false;
    }
  }


  selectListCompare(a, b) {
    return a && b ? a === b : a === b;
  }
  isFieldDisabled(readonly): boolean {
    if (readonly === true) {
      return true;

    } else if (this.max_step !== this.opened_step && this.edit_step === false) {
      return true;

    } else if (this.current_acceptable_activity.some(key => ['SUBMIT', 'SAVE', 'CONTINUE'].includes(key))) {
      return false;

    } else {
      return true;
    }
  }

  parseAcceptableExtentsions(list: string[]) {
    if (!list) {
      return '*/*';
    } else {
      return list.map(extentsion => '.' + extentsion).join(',');
    }
  }

  displayAcceptableExtentsions(list: string[]) {
    if (!list) {
      return this.translate.get('button.all')['value'] || '';
    } else {
      return list.map(extentsion => ' ' + extentsion).join();
    }
  }

  fileDownloadlink(file) {
    const id = file.file_identifier;
    const name = file.file_name;
    const token = sessionStorage.getItem('token');
    return this.settings.url + '/xjson_service/documentFile2/' + id + '/' + name + '?jwt_token=' + token;
  }

  canUploadFile(element): boolean {

    const singeFileRestrictionApplies = (element.multiple === false && element.value.length > 0);

    if (this.isFieldDisabled(element.readonly)) {
      return false;
    } else if (singeFileRestrictionApplies) {
      return false;
    } else {
      return true;
    }
  }

  fileDelete(id, model) {
    const target = model.value.find(file => file.file_identifier === id);
    model.value.splice(model.value.indexOf(target), 1);
  }

  uploadFile(files, element) {
    const model = this.data_elements[element];
    const size_limit = model.max_size;
    this.fileLoading[element] = true;
    const file = files[0];
    const file_size = this.byteToMegabyte(file.size);
    if (file_size > size_limit) {
      this.error[element] = { valid: false, message: this.translate.get('xjson.exceed_file_limit')['value'] };
      files.shift();
      if (files.length > 0) {
        this.uploadFile(files, element);
      } else {
        this.fileLoading[element] = false;
        return;
      }
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {

      const url = '/xjson_service/documentFile2/'.concat(this.form_name, '/', element);
      const payload = {
        file: reader.result.toString().split(',')[1],
        form_name: this.form_name,
        data_element: element
      };
      const subscription = this.http.fileUpload(url, payload, file.name).subscribe(response => {
        this.fileLoading[element] = true;

        const new_file = {
          file_name: file.name,
          file_identifier: response['id']
        };
        model.value.push(new_file);
        files.shift();
        if (files.length > 0) {
          this.uploadFile(files, element);
        } else {
          this.fileLoading[element] = false;
        }
        subscription.unsubscribe();
      });
    };
  }

  fileEventHandler(e, element) {
    this.fileLoading[element] = true;
    if (this.error[element]) {
      delete this.error[element];
    }
    e.preventDefault();
    const files_input = e.target.files || e.dataTransfer.files;
    const files = Object.keys(files_input).map(item => files_input[item]);

    if (files && files.length > 0) {
      this.uploadFile(files, element);
    }
  }

  byteToMegabyte(bytes) {
    return bytes / Math.pow(1024, 2);
  }

  tableColumnName(element, index) {
    return Object.keys(this.data_elements[element].table_columns)[index];
  }

  tableColumnAttribute(element, index, attribute) {
    return this.data_elements[element].table_columns[this.tableColumnName(element, index)][attribute];
  }

  tableAddRow(element) {
    const table = this.data_elements[element];
    const newRow = {};

    for (const col in table.table_columns) {
      const column = table.table_columns[col];
      if (column.default_value !== undefined) {
        newRow[col] = column.default_value;
      } else {
        newRow[col] = null;
      }
      if(column.type === 'address'){
        if(!this.temporaryModel[element]){
          this.temporaryModel[element] = {
            [col]: {
              '0': null
            }
          };
        }else{
          const rowNumber = Object.keys(this.temporaryModel[element][col]).length;
          this.temporaryModel[element][col][rowNumber] = null;
        }
      }
    }
    if (table.value === undefined) { table.value = []; }
    table.value.push(newRow);
  }

  tableDeleteRow(element, rowIndex) {
    this.dialogRef = this.dialog.open(ConfirmPopupDialog, {
      data: {
        title: this.translate.get('xjson.table_delete_row_confirm_modal_title')['value'],
        content: this.translate.get('xjson.table_delete_row_confirm_modal_content')['value'],
        confirm: this.translate.get('button.yes_delete')['value'],
        cancel: this.translate.get('button.cancel')['value'],
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.data_elements[element].value.splice(rowIndex, 1);
        delete this.error[element];
        const validation = this.tableValidation(this.data_elements[element]);
        if (validation.valid !== true) {
          this.error[element] = validation;
        }
        if (this.temporaryModel[element]) {
          for (const column in this.temporaryModel[element]) {
            if (this.temporaryModel[element][column][rowIndex]) {
              delete this.temporaryModel[element][column][rowIndex];
              let rowNr = 0;
              for (const row in this.temporaryModel[element][column]) {
                this.temporaryModel[element][column][rowNr] = this.temporaryModel[element][column][row];
                this.autoCompleteContainer[element][column][rowNr] = this.autoCompleteContainer[element][column][row];
                if (parseInt(row) !== rowNr) {
                  delete this.temporaryModel[element][column][row];
                  delete this.autoCompleteContainer[element][column][row];
                }
                rowNr++;
              }
            }
          }
        }
      }
      this.dialogRef = null;
    });
  }

  promptEditConfirmation() {
    this.dialogRef = this.dialog.open(ConfirmPopupDialog, {
      data: {
        title: this.translate.get('xjson.edit_step_confirm_modal_title')['value'],
        content: this.translate.get('xjson.edit_step_confirm_modal_content')['value'],
        confirm: this.translate.get('button.yes_change')['value'],
        cancel: this.translate.get('button.cancel')['value'],
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.edit_step = true;
        this.data.header.current_step = this.opened_step;
        this.data.header['activity'] = 'SAVE';
        const payload = { form_name: this.form_name, form_info: this.data };
        if (this.test === true) { this.promptDebugDialog(payload); } else { this.viewController(this.data); }
      }
      this.dialogRef = null;
      this.formLoading = false;
    });
  }

  isItemExisting(list, target): boolean {
    return list.some(item => item === target);
  }

  selectLanguage(obj: object) {
    if (obj[this.lang]) { return obj[this.lang]; } else { return obj['et']; }
  }

  setNavigationLinks(list, opened): {}[] {
    if (list.length === 0) { return []; }
    const output: {}[] = [];

    if (list[0] !== opened) {
      const previous = list[list.indexOf(opened) - 1];
      if (this.isStepDisabled(previous) === false) {
        output.push({ label: 'button.previous', step: previous, 'type': 'link' });
      }
    }
    if (list[list.length - 1] !== opened) {
      const next = list[list.indexOf(opened) + 1];
      if (this.isStepDisabled(next) === false) {
        output.push({ label: 'button.next', step: next, 'type': 'link' });
      }
    }
    return output;
  }

  isStepDisabled(step): boolean {
    const max_step = this.max_step;
    const steps = Object.keys(this.data.body.steps);
    const isAfterCurrentStep = steps.indexOf(step) > steps.indexOf(max_step) ? true : false;

    if (this.current_acceptable_activity.includes('VIEW') && !isAfterCurrentStep) {
      return false;

    } else if (isAfterCurrentStep === true) {
      return true;

    } else {
      return false;
    }
  }
  isValidField(field) {
    // check for required field
    if (field.required === true) {
      if (field.value === undefined || field.value === null || field.value === '') {
        return { valid: false, message: this.translate.get('xjson.missing_required_value')['value'] };
      }
    }
    if (typeof field.value !== 'undefined' && field.value !== null) {
      // check for minlength
      if (field.minlength !== undefined && field.value !== '') {
        if (field.value.length < field.minlength) { return { valid: false, message: this.translate.get('xjson.value_min_length_is')['value'] + ' ' + field.minlength }; }
      }
      // check for maxlength
      if (field.maxlength !== undefined && field.value !== '') {
        if (field.value.length > field.maxlength) { return { valid: false, message: this.translate.get('xjson.value_max_length_is')['value'] + ' ' + field.maxlength }; }
      }
      // check for min
      if (field.min !== undefined) {
        if (field.type === 'date') {
          if (moment(field.value).isBefore(field.min)) {
            return { valid: false, message: this.translate.get('xjson.min_value_is')['value'] + ' ' + moment(field.min).format('DD.MM.YYYY') };
          }
        } else if (field.value < field.min) {
          return { valid: false, message: this.translate.get('xjson.min_value_is')['value'] + ' ' + field.min };
        }
      }
      // check for max
      if (field.max !== undefined) {
        if (field.type === 'date') {
          if (moment(field.value).isAfter(field.max)) {
            return { valid: false, message: this.translate.get('xjson.max_value_is')['value'] + ' ' + moment(field.max).format('DD.MM.YYYY') };
          }
        } else if (field.value > field.max) {
          return { valid: false, message: this.translate.get('xjson.max_value_is')['value'] + ' ' + field.max };
        }
      }
      // check for email format
      if (field.type === 'email') {
        const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (reg.test(field.value) === false) { return { valid: false, message: this.translate.get('xjson.enter_valid_email')['value'] }; }
      }
    }
    return { valid: true, message: 'valid' };
  }
  tableValidation(table) {
    let valid = true;
    let validationResult = { valid };
    const validationRows = [];

    if (!table.value || !table.value.length) {
      return { valid: true, message: 'valid' };
    }
    for (const row of table.value) {
      for (const col of Object.keys(row)) {
        const column_properties = JSON.parse(JSON.stringify(table.table_columns[col]));
        column_properties.value = row[col];

        const validation = this.isValidField(column_properties);
        if (validation.valid !== true) {
          valid = false;
          validationRows.push(table.value.indexOf(row));
          validationResult = validation;
        }
      }
    }
    if (validationRows.length) {
      validationResult['rows'] = validationRows;
    }

    return valid ? { valid: true, message: 'valid' } : validationResult;
  }

  isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  validateForm(elements): void {
    const NOT_FOR_VALIDATION = ['heading', 'helpertext',];

    for (const field in elements) {
      if (elements[field].type === 'table') {
        const validation = this.tableValidation(elements[field]);
        if (validation.valid !== true) {
          this.error[field] = validation;
          break;
        }
        if (!this.data_elements[field].value) {
          this.data_elements[field].value = [];
        }
      } else if (!NOT_FOR_VALIDATION.includes(elements[field].type)) {
        const validation = this.isValidField(elements[field]);
        if (validation.valid !== true) {
          this.error[field] = validation;
          break;
        }
      }
    }
  }

  submitForm(activity: string) {
    this.formLoading = true;
    this.error = {};

    if (activity === 'EDIT') {
      this.promptEditConfirmation();
    } else {
      this.edit_step = false;
      this.validateForm(this.data_elements);

      if (Object.keys(this.error).length === 0) {
        this.data.header['activity'] = activity;
        const payload = { form_name: this.form_name, form_info: this.data };
        if (this.test === true) {
          this.promptDebugDialog(payload);
        } else {
          this.getData(payload);
        }
      } else {
        this.error_alert = true;
        this.edit_step = true;
        this.formLoading = false;
        this.scrollPositionController();
      }
    }
  }

  errorHandler(message) {
    console.log('DEBUG_ERROR: ', message);
  }

  closeError() {
    this.error_alert = false;
  }

  selectStep(step) {
    if (step === this.opened_step) {
      return; // to nothing
    } else {
      if (this.isStepDisabled(step)) {
        return this.errorHandler('This step is disabled');
      }
      this.opened_step = step;
      this.viewController(this.data);
    }
  }

  editableStep() {
    return this.data.body.steps[this.opened_step].editable;
  }

  setActivityButtons(activities: string[]) {
    const output = { primary: [], secondary: [] };
    const editableActivities = ['SUBMIT', 'SAVE', 'CONTINUE'];
    if (this.data.body.steps[this.opened_step].sequence < this.data.body.steps[this.max_step].sequence && this.edit_step === false) {
      if (this.editableStep()) {
        const displayEditButton = editableActivities.some(editable => this.isItemExisting(activities, editable));
        if (displayEditButton) { output['primary'].push({ label: 'xjson.edit', action: 'EDIT', style: 'primary' }); }
      }
    } else {
      activities.forEach(activity => {
        if (editableActivities.includes(activity)) {
          output['primary'].push({ label: 'button.' + activity.toLowerCase(), action: activity, style: 'primary' });
        }
      });
    }
    return output;
  }

  returnToPreviousUrl() {
    this.location.back();
  }

  compileAcceptableFormList() {

    this.acceptable_forms = this.acceptable_forms_list_restricted ?
      this.data.header.acceptable_forms.slice(0, this.acceptable_forms_limit) :
      this.data.header.acceptable_forms;

    this.acceptable_forms.forEach((elem, index) => {
      this.acceptable_forms[index].link = this.route.routeConfig.path.replace(':form_name', elem.form_name);
    });

  }

  toggleAcceptableFormList() {
    this.acceptable_forms_list_restricted = this.acceptable_forms_list_restricted ? false : true;
    this.compileAcceptableFormList();
  }

  promptDebugDialog(data) {

    if (this.test === false) {
      return this.getData(data);
    }

    this.dialogRef = this.dialog.open(ConfirmPopupDialog, {
      data: {
        title: data.form_name,
        json: data,
        confirm: 'Jätka',
        cancel: 'Katkesta'
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result === true) {

        this.getData(data);
      }
      this.dialogRef = null;
    });

  }

  setMaxStep(xjson) {
    if (!Object.keys(xjson['body']['steps']).length) {
      return this.errorHandler('No steps available');
    } else if (Object.keys(xjson['body']['steps']).some(step => step === xjson['header']['current_step']) === false) {
      this.max_step = Object.keys(xjson['body']['steps'])[0];
    } else {
      this.max_step = xjson['header']['current_step'];
    }
  }

  getData(data) {

    if (this.test) {
      data.test = true; // TEST
    }

    if (this.queryStrings) {
      data = { ...data, ... this.queryStrings };
    }

    const subscription = this.http.post('/xjson_service?_format=json', data).subscribe(response => {

      if (!response['header']) { return this.errorHandler('Missing header from response'); }
      if (!response['body']) { return this.errorHandler('Missing body from response'); }
      if (!response['body']['steps']) { return this.errorHandler('Missing body.steps from response'); }

      if (response['body']['steps'].length === 0) {
        this.empty_data = true;
      }

      if (response['header']['current_step']) {
        this.setMaxStep(response);
      }

      if (response['header']['acceptable_activity']) {
        if ((!(response['header']['acceptable_activity'] instanceof Array))) {
          return this.errorHandler('Acceptable activity is a string!');
        }
        this.current_acceptable_activity = response['header']['acceptable_activity'];

        const acceptableActivityIncludesTarget = this.current_acceptable_activity.some(key => {
          return ['SUBMIT', 'SAVE', 'CONTINUE'].includes(key);
        });

        if (acceptableActivityIncludesTarget && !response['header']['current_step']) {
          return this.errorHandler('Missing "current_step" while "acceptable_activity" is SUBMIT, SAVE or CONTINUE');
        }
      }

      this.stepController(response);

      this.formLoading = false;

      subscription.unsubscribe();
    });

  }

  stepController(xjson) {
    this.opened_step = this.max_step;
    this.viewController(xjson);
  }


  viewController(xjson) {
    this.tableCountPerStep = 0;
    this.tableIndexes = [];
    this.tableOverflown = {};
    this.elemAtStart = {};
    this.data = xjson;
    if (typeof this.opened_step !== 'undefined') {
      this.data_elements = this.data.body.steps[this.opened_step].data_elements;
      // Concat. all message arrays and display them at all times
      this.data_messages = [...this.data.body.messages, ...this.data.body.steps[this.opened_step].messages];
    } else {
      this.data_messages = this.data.body.messages;
    }

    if (this.data_elements) {
      // Count table elements and set initial settings
      Object.values(this.data_elements).forEach((elem, index) => {
        if (elem['type'] === 'table') { this.tableIndexes.push(index); }
      });
      this.tableIndexes.forEach((elem) => {
        this.elemAtStart[elem] = true;
        this.tableOverflown[elem] = true;
      });

      this.navigationLinks = this.setNavigationLinks(Object.keys(this.data.body.steps), this.opened_step);

      this.activityButtons = this.setActivityButtons(this.data.header.acceptable_activity);

      this.fillAddressFieldsTemporaryModel(this.data_elements);

      if (typeof this.data.header.acceptable_forms !== 'undefined') {
        this.compileAcceptableFormList();
      }

      if (!this.edit_step) {
        this.scrollPositionController();
      }
    }

  }

  ngOnInit() {

    this.pathWatcher();
    const payload = { form_name: this.form_name };

    if (this.test === true) {
      this.promptDebugDialog(payload);
    } else {
      // TODO: create catcher to prevent endless loop requests...
      this.getData(payload);
    }
  }

  ngOnDestroy() {
    /* Clear all subscriptions */
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
}
