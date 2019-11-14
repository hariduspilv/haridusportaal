import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import * as _moment from 'moment';
const moment = _moment;
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { SettingsService, ModalService } from '@app/_services';

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
  providers: [],
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
  public upperInfoText;

  public lang: string;
  public form_name: string;
  public form_route: string;
  public subscriptions: Subscription[] = [];
  public datepickerFocus = false;
  public acceptable_forms_list_restricted = true;
  public temporaryModel = {};
  public data;
  public edit_step = false;
  public numberOfSteps: number;
  public empty_data = false;
  public acceptable_forms = [];
  public acceptable_forms_limit = 4;
  public opened_step: string;
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
  public scrollableTables = {};
  public visibleTableLength = {};
  public viewOnlyStep: boolean;
  public path: any;

  public autoCompleteContainer = {};
  public autocompleteDebouncer = {};
  public autocompleteSubscription = {};
  public fullAddressSubscription = {};
  public autocompleteLoader = true;
  public addressFieldFocus = false;
  public observableStep;

  constructor(
    private translate: TranslateService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private settings: SettingsService,
    private modalService: ModalService,
  ) { }

  pathWatcher() {
    const strings = this.route.queryParams.subscribe(
      (strings: ActivatedRoute) => {
        this.test = (strings['test'] === 'true');
        if (strings['year'] !== undefined) { this.queryStrings['year'] = Number(strings['year']); }
        if (strings['draft'] === 'true') { this.queryStrings['status'] = 'draft'; }
        if (strings['existing'] === 'true') { this.queryStrings['status'] = 'submitted'; }
        if (strings['educationalInstitutions_id']) { this.queryStrings['educationalInstitutionsId'] = Number(strings['educationalInstitutions_id']); }
        if (strings['identifier'] !== undefined) { this.queryStrings['identifier'] = Number(strings['identifier']); }
      }
    );

    this.subscriptions = [...this.subscriptions, strings];
  }

  isArray(obj: any) {
    return Array.isArray(obj);
  }

  getFormName() {
    const url = `${this.settings.url}/xjson_service/form_name?_format=json`;

    const subscription = this.http.post(url, { form_path: this.form_route }).subscribe((response: any) => {
      this.form_name = response;
      subscription.unsubscribe();
    });
  }

  changeView(key) {
    this.view = key;
  }

  scrollableTableDeterminant(label) {
    const _opened_step = this.opened_step;
    const _scrollableTables = this.scrollableTables;
    if (_opened_step) {
      setTimeout(function () {
        const table = document.getElementById(label + 'Table');
        const content = document.getElementById(label + 'Content');
        _scrollableTables[label] = table.offsetWidth < content.offsetWidth ? true : false;
      }, 0);
    }
  }

  tableVisibleColumns(label, columns) {
    let visibleColumns = 0;
    const _visibleTableLength = this.visibleTableLength;

    Object.values(columns).forEach((elem) => {
      if (!elem['hidden']) {
        visibleColumns++;
      }
    });

    _visibleTableLength[label] = visibleColumns;
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

    return date ? moment((String(date).split('.')).reverse().join('-')) : '';
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

    }
    return true;
  }

  isFieldHidden(element): boolean {
    const model = this.data_elements[element];

    if (model) {
      if (model.hidden) {
        return true;
      }

      if (model.depend_on) {
        if ((Array.isArray(this.data_elements[model.depend_on].value) && !this.data_elements[model.depend_on].value.length) || (!Array.isArray(this.data_elements[model.depend_on].value) && !this.data_elements[model.depend_on].value)) {
          if (model.value && Array.isArray(model.value)) {
            this.data_elements[element].value = [];
          } else if (model.value && !Array.isArray(model.value)) {
            this.data_elements[element].value = '';
          }
          return true;
        }
      }
    }

    return false;
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

  stopFileUpload(element) {
    this.fileLoading[element] = false;
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

  /*   uploadFile(files, element) {
      const model = this.data_elements[element];
      const size_limit = model.max_size;
      this.fileLoading[element] = true;
      const file = files[0];
      const file_size = this.byteToMegabyte(file.size);
      if (file_size > size_limit || (model.acceptable_extensions && !model.acceptable_extensions.includes(file.name.split('.').pop()))) {
        this.error[element] = { valid: false, message: file_size > size_limit ? this.translate.get('xjson.exceed_file_limit')['value'] : this.translate.get('xjson.unacceptable_extension')['value'] };
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
        }, (err) => {
          const message = err.error ? err.error.message : err.message;
          this.error[element] = { valid: false, message };
          this.fileLoading[element] = false;
          subscription.unsubscribe();
        });
      };
    } */

  /*   fileEventHandler(e, element) {
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
    } */

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
      if (column.type === 'address') {
        if (!this.temporaryModel[element]) {
          this.temporaryModel[element] = {
            [col]: {
              '0': null
            }
          };
        } else {
          const rowNumber = Object.keys(this.temporaryModel[element][col]).length;
          this.temporaryModel[element][col][rowNumber] = null;
        }
      }
    }
    if (table.value === undefined) { table.value = []; }
    table.value.push(newRow);
    this.scrollableTableDeterminant(element);
  }
  /* 
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
          this.scrollableTableDeterminant(element);
        }
        this.dialogRef = null;
      });
    }*/

  promptEditConfirmation() {
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
      if (field.value === undefined || field.value === null || (field.type === 'selectlist' && field.value === 'null') || field.value === '' || (Array.isArray(field.value) && !field.value.length)) {
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
          const valDate = moment(field.value, XJSON_DATEPICKER_FORMAT.parse.dateInput);
          const minDate = field.min === 'today' ? moment() : moment(field.min, XJSON_DATEPICKER_FORMAT.parse.dateInput);
          if (valDate < minDate) {
            return { valid: false, message: this.translate.get('xjson.min_value_is')['value'] + ' ' + moment(minDate).format('DD.MM.YYYY') };
          }
        } else if (field.value < field.min) {
          return { valid: false, message: this.translate.get('xjson.min_value_is')['value'] + ' ' + field.min };
        }
      }
      // check for max
      if (field.max !== undefined) {
        if (field.type === 'date') {
          const valDate = moment(field.value, XJSON_DATEPICKER_FORMAT.parse.dateInput);
          const maxDate = field.max === 'today' ? moment() : moment(field.max, XJSON_DATEPICKER_FORMAT.parse.dateInput);
          if (valDate > maxDate) {
            return { valid: false, message: this.translate.get('xjson.max_value_is')['value'] + ' ' + moment(maxDate).format('DD.MM.YYYY') };
          }
        } else if (field.value > field.max) {
          return { valid: false, message: this.translate.get('xjson.max_value_is')['value'] + ' ' + field.max };
        }
      }
      // check for email format
      if (field.type === 'email') {
        const reg = /^(?!\.)((?!.*\.{2})[a-zA-Z0-9\u0080-\u00FF\u0100-\u017F\u0180-\u024F\u0250-\u02AF\u0300-\u036F\u0370-\u03FF\u0400-\u04FF\u0500-\u052F\u0530-\u058F\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1B00-\u1B7F\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFFu20D0-\u20FF\u2100-\u214F\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2F00-\u2FDF\u2FF0-\u2FFF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA700-\uA71F\uA800-\uA82F\uA840-\uA87F\uAC00-\uD7AF\uF900-\uFAFF\.!#$%&'*+-/=?^_`{|}~\-\d]+)@(?!\.)([a-zA-Z0-9\u0080-\u00FF\u0100-\u017F\u0180-\u024F\u0250-\u02AF\u0300-\u036F\u0370-\u03FF\u0400-\u04FF\u0500-\u052F\u0530-\u058F\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1B00-\u1B7F\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFF\u20D0-\u20FF\u2100-\u214F\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2F00-\u2FDF\u2FF0-\u2FFF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA700-\uA71F\uA800-\uA82F\uA840-\uA87F\uAC00-\uD7AF\uF900-\uFAFF\-\.\d]+)((\.([a-zA-Z\u0080-\u00FF\u0100-\u017F\u0180-\u024F\u0250-\u02AF\u0300-\u036F\u0370-\u03FF\u0400-\u04FF\u0500-\u052F\u0530-\u058F\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1B00-\u1B7F\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFF\u20D0-\u20FF\u2100-\u214F\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2F00-\u2FDF\u2FF0-\u2FFF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA700-\uA71F\uA800-\uA82F\uA840-\uA87F\uAC00-\uD7AF\uF900-\uFAFF]){2,63})+)$/i;
        if (reg.test(field.value) === false) { return { valid: false, message: this.translate.get('xjson.enter_valid_email')['value'] }; }
      }

      if (field.type === 'number' && typeof field.value === 'string') {
        if (isNaN(field.value.replace(/\s/g, ''))) {
          return { valid: false, message: this.translate.get('xjson.enter_valid_number')['value'] };
        }
      }

      // check for checkbox value
      if (field.type === 'checkbox' && field.required === true && field.value === false) {
        return { valid: false, message: this.translate.get('xjson.missing_required_value')['value'] };
      }

      if (field.type === 'iban') {
        const reg = /^(?:(?:IT|SM)\d{2}[A-Z]\d{22}|CY\d{2}[A-Z]\d{23}|NL\d{2}[A-Z]{4}\d{10}|LV\d{2}[A-Z]{4}\d{13}|(?:BG|BH|GB|IE)\d{2}[A-Z]{4}\d{14}|GI\d{2}[A-Z]{4}\d{15}|RO\d{2}[A-Z]{4}\d{16}|KW\d{2}[A-Z]{4}\d{22}|MT\d{2}[A-Z]{4}\d{23}|NO\d{13}|(?:DK|FI|GL|FO)\d{16}|MK\d{17}|(?:AT|EE|KZ|LU|XK)\d{18}|(?:BA|HR|LI|CH|CR)\d{19}|(?:GE|DE|LT|ME|RS)\d{20}|IL\d{21}|(?:AD|CZ|ES|MD|SA)\d{22}|PT\d{23}|(?:BE|IS)\d{24}|(?:FR|MR|MC)\d{25}|(?:AL|DO|LB|PL)\d{26}|(?:AZ|HU)\d{27}|(?:GR|MU)\d{28})$/i;
        if (reg.test(field.value) === false) { return { valid: false, message: this.translate.get('xjson.enter_valid_iban')['value'] }; }
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
    const NOT_FOR_VALIDATION = ['heading', 'helpertext'];

    for (const field in elements) {
      if (elements[field].type === 'table') {
        const validation = this.tableValidation(elements[field]);
        if (validation.valid !== true) {
          this.error[field] = validation;
          continue;
        }
        if (!this.data_elements[field].value) {
          this.data_elements[field].value = [];
        }

        for (const column in this.data_elements[field].table_columns) {
          if (this.data_elements[field].table_columns[column].type === 'number') {
            this.data_elements[field].value.forEach((element, index) => {
              if (typeof this.data_elements[field].value[index][column] === 'string') {
                this.data_elements[field].value[index][column] = parseInt(this.data_elements[field].value[index][column].replace(/\s/g, ''));
              }
            });
          }
        }

      } else if (!NOT_FOR_VALIDATION.includes(elements[field].type) && !this.isFieldHidden(field)) {
        const validation = this.isValidField(elements[field]);
        if (validation.valid !== true) {
          this.error[field] = validation;
          continue;
        }

        if (this.data_elements[field].type === 'number' && typeof this.data_elements[field].value === 'string') {
          this.data_elements[field].value = parseInt(this.data_elements[field].value.replace(/\s/g, ''));
        }
      }
    }
  }

  submitForm(activity: string) {
    this.error = {};

    if (activity === 'EDIT') {
      this.promptEditConfirmation();
    } else {
      this.formLoading = true;
      this.validateForm(this.data_elements);

      if (Object.keys(this.error).length === 0) {
        this.edit_step = false;
        this.error_alert = false;
        this.data.header['activity'] = activity;
        const payload = { form_name: this.form_route, form_info: this.data };
        if (this.test === true) {
          this.promptDebugDialog(payload);
        } else {
          this.getData(payload);
        }
      } else {
        this.edit_step = this.edit_step ? true : false;
        this.error_alert = true;
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

  closeMessage(i) {
    this.data_messages.splice(i, 1);
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

  cancelEventHandler() {
    if (!this.edit_step) {
      this.location.back();
    }
  }

  compileAcceptableFormList() {

    this.acceptable_forms = this.acceptable_forms_list_restricted ?
      this.data.header.acceptable_form.slice(0, this.acceptable_forms_limit) :
      this.data.header.acceptable_form;

    const params = [];
    this.route.queryParams.subscribe(
      (strings: ActivatedRoute) => {
        for (const key in strings) {
          if (strings.hasOwnProperty(key)) {
            params.push(key + '=' + strings[key]);
          }
        }
      }
    );
    const urlParams = params.join('&');

    this.acceptable_forms.forEach((elem, index) => {
      this.acceptable_forms[index].link = this.route.routeConfig.path.replace(':form_name', elem.form_name).concat('?', urlParams);
    });

  }

  toggleAcceptableFormList() {
    this.acceptable_forms_list_restricted = this.acceptable_forms_list_restricted ? false : true;
    this.compileAcceptableFormList();
  }

  getUpperInfoText() {
    const infoTextTranslationKey = 'xjson.' + this.form_name + '_infotext';
    const infoTextTranslation = this.translate.get(infoTextTranslationKey)['value'];
    this.upperInfoText = infoTextTranslation === infoTextTranslationKey ? false : infoTextTranslation;
  }

  getStepViewStatus() {
    this.viewOnlyStep = true;
    for (const [label, elem] of Object.entries(this.data_elements)) {
      if (elem['type'] === 'table') {
        this.scrollableTableDeterminant(label);
        this.tableVisibleColumns(label, elem['table_columns']);

        for (const key in elem['table_columns']) {
          if (this.viewOnlyStep) {
            this.isViewOnlyStep(elem['table_columns'][key]);
          }
        }
      } else if (this.viewOnlyStep) {
        this.isViewOnlyStep(elem);
      }
    }
  }

  isViewOnlyStep(element) {
    if (!(element['hidden'] || element['readonly'])) {
      this.viewOnlyStep = false;
    }
  }

  promptDebugDialog(data) {

    if (this.test) {
      return this.getData(data);
    }
    console.log('jou');

    this.modalService.toggle('debugModal');

    /*       this.dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
      
              this.getData(data);
            }
            this.dialogRef = null;
          }); */

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

    const subscription = this.http.post(`${this.settings.url}/xjson_service?_format=json`, data)
      .subscribe((response) => {

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

    if (this.data.body.steps) {
      this.numberOfSteps = Object.keys(xjson.body.steps).length;
    }

    this.getUpperInfoText();

    if (this.data_elements) {
      // Count table elements and set initial settings
      Object.values(this.data_elements).forEach((elem, index) => {
        if (elem['type'] === 'table') {
          this.tableIndexes.push(index);
        }
      });
      this.tableIndexes.forEach((elem) => {
        this.elemAtStart[elem] = true;
        this.tableOverflown[elem] = true;
      });

      this.navigationLinks = this.setNavigationLinks(Object.keys(this.data.body.steps), this.opened_step);

      this.activityButtons = this.setActivityButtons(this.data.header.acceptable_activity);

      if (typeof this.data.header.acceptable_form !== 'undefined') {
        this.compileAcceptableFormList();
      }

      if (!this.edit_step) {
        this.scrollPositionController();
      }

      for (const [label, elem] of Object.entries(this.data_elements)) {
        if (elem['type'] === 'table') {
          this.scrollableTableDeterminant(label);
        }
        if (elem['type'] === 'selectlist') {
          this.data_elements[label].value = String(this.data_elements[label].value);
        }
      }

      this.getStepViewStatus();
    }
  }

  ngOnInit() {
    this.path = decodeURI(this.location.path());
    this.form_route = decodeURI(this.router.url).split('?')[0];
    this.lang = 'et';
    this.getFormName();
    this.pathWatcher();

    const payload = { form_name: this.form_route };

    if (this.test) {
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
