import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import * as _moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { AlertsService, ModalService, SettingsService, UploadService } from '@app/_services';
import { AddressService } from '@app/_services/AddressService';
import { NgbDateStruct } from '@app/_assets/formItem';
import { XjsonDateRangeObject } from './xjson-date-range-object';

const moment = _moment;

const XJSON_DATEPICKER_FORMAT = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD.MM.YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
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
  public dataElementsHaveValues = true;
  public formVisible = true;

  public objectKeys = Object.keys;
  public test: boolean;
  public queryStrings = {};
  public fileLoading = {};
  public formLoading = false;
  public upperInfoText;
  public saved = false;

  public fileUploadElement: string;
  public fileUploadCol: string;
  public fileUploadRow: number;
  public tableUpload = false;

  public lang: string;
  public form_name: string;
  public form_route: string;
  public formKey = '';
  public subscriptions: Subscription[] = [];
  public setAlerts: string[] = [];
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
  public modalRef: any;
  public deleteTableElement: any;
  public deleteTableRow: any;
  public objectEntries = Object.entries;

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
    public modalService: ModalService,
    private alertsService: AlertsService,
    private uploadService: UploadService,
    private addressService: AddressService,
  ) {
  }

  pathWatcher() {
    const strings = this.route.queryParams.subscribe(
      (strings: ActivatedRoute) => {
        this.test = (strings['test'] === 'true');
        if (strings['aasta'] !== undefined) {
          this.queryStrings['year'] = Number(strings['aasta']);
        }
        if (strings['mustand'] === 'true') {
          this.queryStrings['status'] = 'draft';
        }
        if (strings['eksisteerib'] === 'true') {
          this.queryStrings['status'] = 'submitted';
        }
        if (strings['õppeasutus']) {
          this.queryStrings['educationalInstitutionsId'] = Number(strings['õppeasutus']);
        }
        if (strings['id'] !== undefined) {
          this.queryStrings['identifier'] = !isNaN(Number(strings['id'])) ? Number(strings['id']) : strings['id'];
        }
      },
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
      setTimeout(
        () => {
          const table = document.getElementById(`${label}Table`);
          if (table) {
            const content = document.getElementById(`${label}Content`);
            _scrollableTables[label] = table.offsetWidth < content.offsetWidth;
          }
        },
        0);
    }
  }

  tableVisibleColumns(label, columns) {
    let visibleColumns = 0;
    const _visibleTableLength = this.visibleTableLength;

    Object.values(columns).forEach((elem) => {
      if (!elem['hidden']) {
        visibleColumns = visibleColumns + 1;
      }
    });

    _visibleTableLength[label] = visibleColumns;
  }

  scrollPositionController() {
    document.querySelector('.app-content').scrollTop = 0;
  }

  setDatepickerValue(event, element, rowindex, col) {
    if (!this.datepickerFocus) {
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

    }
    if (this.max_step !== this.opened_step && !this.edit_step) {
      return true;

    }
    return !this.current_acceptable_activity.some(key => ['SUBMIT', 'SAVE', 'CONTINUE'].includes(key));
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
    }
    return list.map(extentsion => `.${extentsion}`).join(',');

  }

  displayAcceptableExtentsions(list: string[]) {
    if (!list) {
      return this.translate.get('button.all') || '';
    }
    return list.map(extentsion => ` ${extentsion}`).join();

  }

  fileDownloadlink(file) {
    const id = file.file_identifier;
    const name = file.file_name;
    const token = sessionStorage.getItem('token');
    const docId = this.data.header.identifier;

    if (this.formKey === 'MTSYS') {
      return `${this.settings.url}/xjson_service/documentFile2/${id}/${name}/${this.formKey}?jwt_token=${token}&id=${this.data.header.agents[0].owner_id}&doc_id=${docId}`;
    }
    if (this.formKey === 'KUTSE') {
      return `${this.settings.url}/xjson_service/documentFile2/${id}/${name}/${this.formKey}?jwt_token=${token}`;
    }
    return `${this.settings.url}/xjson_service/documentFile2/${id}/${name}/${this.formKey}?jwt_token=${token}&id=${this.data.header.agents[0].owner_id}`;
  }

  fileModal(element, col, row) {
    this.fileUploadElement = element;
    if (this.error[this.fileUploadElement]) {
      this.error[this.fileUploadElement] = {};
    }
    this.fileUploadCol = col;
    this.fileUploadRow = row;
    this.tableUpload = true;
    this.modalService.toggle('addFile');
  }

  stopFileUpload(element) {
    this.fileLoading[element] = false;
  }

  canUploadFile(element, table = false): boolean {

    const fieldVal = table ?
      this.data_elements[this.fileUploadElement].value[this.fileUploadRow][this.fileUploadCol] :
      element.value;

    const singeFileRestrictionApplies =
      table ? (!element.multiple && fieldVal && fieldVal.length > 0) :
        (!element.multiple && fieldVal && fieldVal.length > 0);

    if (this.isFieldDisabled(element.readonly)) {
      return false;
    }
    return !singeFileRestrictionApplies;
  }

  fileDelete(id, model) {
    const target = model.value.find(file => file.file_identifier === id);
    model.value.splice(model.value.indexOf(target), 1);
  }

  tableFileDelete(id, model) {
    const target = model.find(file => file.file_identifier === id);
    model.splice(model.indexOf(target), 1);
  }

  uploadFile(files, element) {
    if (!this.data_elements[element].value) {
      this.data_elements[element].value = [];
    }
    const model = this.data_elements[element];
    const size_limit = model.max_size;
    this.fileLoading[element] = true;
    const file = files[0];
    const file_size = this.byteToMegabyte(file.size);
    if (file_size > size_limit || (model.acceptable_extensions && !model.acceptable_extensions.includes(file.name.split('.').pop().toLowerCase()))) {
      this.error[element] = {
        valid: false,
        message: file_size > size_limit ? this.translate.get('xjson.exceed_file_limit') : this.translate.get('xjson.unacceptable_extension'),
      };
      files.shift();
      if (files.length > 0) {
        this.uploadFile(files, element);
      } else {
        this.fileLoading[element] = false;
        return;
      }
    }

    const found = this.data_elements[element].value.findIndex(element => element.file_name === file.name);
    if (found >= 0) {
      this.data_elements[element].value.splice(found, 1);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {

      const url = `${this.settings.url}/xjson_service/documentFile2/${this.form_name}/${element}`;
      const payload = {
        file: reader.result.toString().split(',')[1],
        form_name: this.form_name,
        form_key: this.formKey,
        data_element: element,
      };

      const subscription = this.uploadService.fileUpload(url, payload, file.name).subscribe(
        (response) => {
          this.fileLoading[element] = true;

          const new_file = {
            file_name: file.name,
            file_identifier: response['id'],
          };
          model.value.push(new_file);
          files.shift();
          if (files.length > 0) {
            this.uploadFile(files, element);
          } else {
            this.fileLoading[element] = false;
            if (model.submit_on_change) {
              this.saveFormWithFile();
            }
          }
          subscription.unsubscribe();
        },
        (err) => {
          const message = err.error ? err.error.message : err.message;
          this.error[element] = { message, valid: false };
          this.fileLoading[element] = false;
          subscription.unsubscribe();
        });
    };
  }

  uploadTableFile(files) {
    if (!this.data_elements[this.fileUploadElement].value[this.fileUploadRow][this.fileUploadCol]) {
      this.data_elements[this.fileUploadElement].value[this.fileUploadRow][this.fileUploadCol] = [];
    }
    const model = this.data_elements[this.fileUploadElement].table_columns[this.fileUploadCol];
    const size_limit = model.max_size;
    this.fileLoading[this.fileUploadElement] = true;
    const file = files[0];
    const file_size = this.byteToMegabyte(file.size);
    if (file_size > size_limit || (model.acceptable_extensions && !model.acceptable_extensions.includes(file.name.toLowerCase().split('.').pop()))) {
      this.error[this.fileUploadElement] = {
        type: 'file',
        valid: false,
        message: file_size > size_limit ? this.translate.get('xjson.exceed_file_limit') : this.translate.get('xjson.unacceptable_extension'),
      };
      this.removeFileUploadErrorInMs(6000);
      files.shift();
      if (files.length > 0) {
        this.uploadTableFile(files);
      } else {
        this.fileLoading[this.fileUploadElement] = false;
        return;
      }
    }

    const found = this.data_elements[this.fileUploadElement].value[this.fileUploadRow][this.fileUploadCol].findIndex(element => element.file_name === file.name);
    if (found >= 0) {
      this.data_elements[this.fileUploadElement].value[this.fileUploadRow][this.fileUploadCol].splice(found, 1);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {

      const url = `${this.settings.url}/xjson_service/documentFile2/${this.form_name}/${this.fileUploadElement}`;
      const payload = {
        file: reader.result.toString().split(',')[1],
        form_name: this.form_name,
        form_key: this.formKey,
        data_element: this.fileUploadElement,
        table_element: this.fileUploadCol,
      };

      const subscription = this.uploadService.fileUpload(url, payload, file.name).subscribe({
        next: (response) => {
          this.fileLoading[this.fileUploadElement] = true;

          const new_file = {
            file_name: file.name,
            file_identifier: response['id'],
          };
          this.data_elements[this.fileUploadElement].value[this.fileUploadRow][this.fileUploadCol].push(new_file);
          files.shift();
          if (files.length > 0) {
            this.uploadTableFile(files);
          } else {
            this.fileLoading[this.fileUploadElement] = false;
          }
          subscription.unsubscribe();
        },
        error: (err) => {
          const message = err.error ? err.error.message : err.message;
          this.error[this.fileUploadElement] = { message, valid: false };
          this.fileLoading[this.fileUploadElement] = false;
          this.removeFileUploadErrorInMs(6000);
          subscription.unsubscribe();
        }
      });
    };
  }

  removeFileUploadErrorInMs(timeout: number) {
    setTimeout(
      () => {
        this.error[this.fileUploadElement] = {};
      },
      timeout || 0);
  }

  saveFormWithFile() {
    this.data.header.parameters.fileSubmit = true;
    this.submitForm('SAVE');
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
      this.tableUpload ? this.uploadTableFile(files) : this.uploadFile(files, element);
    } else {
      this.fileLoading[element] = false;
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

  private convertDateRangeAttributeToNgbDateStruct(dateObject: XjsonDateRangeObject): NgbDateStruct {
    if (!dateObject) return null;
    return {
      year: parseInt(dateObject.year, 10),
      month: parseInt(dateObject.month, 10),
      day: parseInt(dateObject.day, 10),
    };
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
        newRow[col] = {
          address: '',
        };
      }
    }
    if (table.value === undefined) {
      table.value = [];
    }
    table.value.push(newRow);
    this.scrollableTableDeterminant(element);
  }

  confirmRowDelete() {
    const element = this.deleteTableElement;
    const rowIndex = this.deleteTableRow;
    this.data_elements[element].value.splice(rowIndex, 1);
    delete this.error[element];
    const validation = this.tableValidation(this.data_elements[element]);
    if (!validation.valid) {
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
            rowNr = rowNr + 1;
          }
        }
      }
    }
    this.modalService.close('deleteTableRow');
    this.scrollableTableDeterminant(element);
  }

  tableDeleteRow(element, rowIndex) {
    this.modalRef = this.modalService.toggle('deleteTableRow');
    this.deleteTableElement = element;
    this.deleteTableRow = rowIndex;
  }

  promptEditConfirmation() {
    this.modalRef = this.modalService.toggle('editStep');
  }

  toggleStepEdit() {
    this.formLoading = true;
    this.edit_step = true;
    this.data.header.current_step = this.opened_step;
    if (this.data.header.acceptable_activity.includes('CHANGE')) {
      this.submitForm('CHANGE');
      this.modalService.close('editStep');
    } else {
      this.data.header.acceptable_activity = ['SAVE'];
      this.modalService.close('editStep');
      this.viewController(this.data);
    }
    this.formLoading = false;
  }

  isItemExisting(list, target): boolean {
    return list.some(item => item === target);
  }

  selectLanguage(obj: object) {
    if (obj[this.lang]) {
      return obj[this.lang];
    }
    return obj['et'];
  }

  setNavigationLinks(list, opened): {}[] {
    if (list.length === 0) {
      return [];
    }
    const output: {}[] = [];

    if (list[0] !== opened) {
      const previous = list[list.indexOf(opened) - 1];
      if (!this.isStepDisabled(previous)) {
        output.push({ label: 'button.previous', step: previous, type: 'link' });
      }
    }
    if (list[list.length - 1] !== opened) {
      const next = list[list.indexOf(opened) + 1];
      if (!this.isStepDisabled(next)) {
        output.push({ label: 'button.next', step: next, type: 'link' });
      }
    }
    return output;
  }

  isStepDisabled(step): boolean {
    const max_step = this.max_step;
    const steps = Object.keys(this.data.body.steps);
    const isAfterCurrentStep = steps.indexOf(step) > steps.indexOf(max_step);

    if (this.current_acceptable_activity.includes('VIEW') && !isAfterCurrentStep) {
      return false;

    }
    return isAfterCurrentStep;
  }

  isValidField(field) {
    // check for required field
    if (field.required === true) {
      if (field.type === 'address' && field.value !== '' && !field.value.addressHumanReadable) {
        return { valid: false, message: this.translate.get('xjson.missing_required_value') };
      }
      if (field.value === undefined || field.value === 'undefined' || field.value === null ||
        (field.type === 'selectlist' && field.value === 'null') || field.value === ''
        || (Array.isArray(field.value) && !field.value.length)) {
        return { valid: false, message: this.translate.get('xjson.missing_required_value') };
      }
    }
    if (typeof field.value !== 'undefined' && field.value !== null) {
      // check for minlength
      if (field.minlength !== undefined && field.value !== '') {
        if (field.value.length < field.minlength) {
          return {
            valid: false,
            message: `${this.translate.get('xjson.value_min_length_is')} ${field.minlength}`,
          };
        }
      }
      // check for maxlength
      if (field.maxlength !== undefined && field.value !== '') {
        if (field.value.length > field.maxlength) {
          return {
            valid: false,
            message: `${this.translate.get('xjson.value_max_length_is')} ${field.maxlength}`,
          };
        }
      }
      // check for min
      if (field.min !== undefined) {
        if (field.type === 'date') {
          const valDate = moment(field.value, XJSON_DATEPICKER_FORMAT.parse.dateInput);
          const minDate = field.min === 'today' ? moment() : moment(field.min, XJSON_DATEPICKER_FORMAT.parse.dateInput);
          if (valDate < minDate) {
            return {
              valid: false,
              message: `${this.translate.get('xjson.min_value_is')} ${moment(minDate).format('DD.MM.YYYY')}`,
            };
          }
        } else if (field.value < field.min) {
          return {
            valid: false,
            message: `${this.translate.get('xjson.min_value_is')} ${field.min}`,
          };
        }
      }
      // check for max
      if (field.max !== undefined) {
        if (field.type === 'date') {
          const valDate = moment(field.value, XJSON_DATEPICKER_FORMAT.parse.dateInput);
          const maxDate = field.max === 'today' ? moment() : moment(field.max, XJSON_DATEPICKER_FORMAT.parse.dateInput);
          if (valDate > maxDate) {
            return {
              valid: false,
              message: `${this.translate.get('xjson.max_value_is')} ${moment(maxDate).format('DD.MM.YYYY')}`,
            };
          }
        } else if (field.value > field.max) {
          return {
            valid: false,
            message: `${this.translate.get('xjson.max_value_is')} ${field.max}`,
          };
        }
      }
      // check for email format
      if (field.type === 'email') {
        const reg = /^(?!\.)((?!.*\.{2})[a-zA-Z0-9\u0080-\u00FF\u0100-\u017F\u0180-\u024F\u0250-\u02AF\u0300-\u036F\u0370-\u03FF\u0400-\u04FF\u0500-\u052F\u0530-\u058F\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1B00-\u1B7F\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFFu20D0-\u20FF\u2100-\u214F\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2F00-\u2FDF\u2FF0-\u2FFF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA700-\uA71F\uA800-\uA82F\uA840-\uA87F\uAC00-\uD7AF\uF900-\uFAFF\.!#$%&'*+-/=?^_`{|}~\-\d]+)@(?!\.)([a-zA-Z0-9\u0080-\u00FF\u0100-\u017F\u0180-\u024F\u0250-\u02AF\u0300-\u036F\u0370-\u03FF\u0400-\u04FF\u0500-\u052F\u0530-\u058F\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1B00-\u1B7F\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFF\u20D0-\u20FF\u2100-\u214F\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2F00-\u2FDF\u2FF0-\u2FFF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA700-\uA71F\uA800-\uA82F\uA840-\uA87F\uAC00-\uD7AF\uF900-\uFAFF\-\.\d]+)((\.([a-zA-Z\u0080-\u00FF\u0100-\u017F\u0180-\u024F\u0250-\u02AF\u0300-\u036F\u0370-\u03FF\u0400-\u04FF\u0500-\u052F\u0530-\u058F\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1B00-\u1B7F\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFF\u20D0-\u20FF\u2100-\u214F\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2F00-\u2FDF\u2FF0-\u2FFF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA700-\uA71F\uA800-\uA82F\uA840-\uA87F\uAC00-\uD7AF\uF900-\uFAFF]){2,63})+)$/i;
        if (!reg.test(field.value)) {
          return { valid: false, message: this.translate.get('xjson.enter_valid_email') };
        }
      }

      if (field.type === 'number' && typeof field.value === 'string') {
        if (isNaN(field.value.replace(/\s/g, ''))) {
          return { valid: false, message: this.translate.get('xjson.enter_valid_number') };
        }
      }

      // check for checkbox value
      if (field.type === 'checkbox' && field.required === true && field.value === false) {
        return { valid: false, message: this.translate.get('xjson.missing_required_value') };
      }

      if (field.type === 'iban') {
        const reg = /^AL\d{10}[0-9A-Z]{16}$|^AD\d{10}[0-9A-Z]{12}$|^AT\d{18}$|^AZ\d{2}[A-Z]{4}[0-9A-Z]{20}$|^BH\d{2}[A-Z]{4}[0-9A-Z]{14}$|^BY\d{2}[A-Z]{4}[0-9A-Z]{20}$|^BE\d{14}$|^BA\d{18}$|^BR\d{10}[0-9A-Z]{17}$|^BG\d{2}[A-Z]{4}\d{6}[0-9A-Z]{8}$|^CR\d{20}$|^HR\d{19}$|^CY\d{10}[0-9A-Z]{16}$|^CZ\d{22}$|^DK\d{16}$|^FO\d{16}$|^GL\d{16}$|^GT\d{2}[0-9A-Z]{4}\d{20}$|^KW\d{2}[0-9A-Z]{4}\d{22}$|^MD\d{2}[0-9A-Z]{2}\d{18}$|^PK\d{2}[0-9A-Z]{4}\d{16}$|^PS\d{2}[0-9A-Z]{4}\d{21}$|^VA\d{2}\d{18}$|^KZ\d{2}\d{16}$|^DO\d{2}[0-9A-Z]{4}\d{20}$|^EG\d{2}[0-9A-Z]{4}\d{21}$|^SV\d{2}[0-9A-Z]{4}\d{20}$|^VG\d{2}[0-9A-Z]{4}\d{16}$|^EE\d{18}$|^FI\d{16}$|^UA\d{27}$|^FR\d{12}[0-9A-Z]{11}\d{2}$|^GE\d{2}[A-Z]{2}\d{16}$|^DE\d{20}$|^GI\d{2}[A-Z]{4}[0-9A-Z]{15}$|^JO\d{2}[A-Z]{4}[0-9A-Z]{22}$|^GR\d{9}[0-9A-Z]{16}$|^HU\d{26}$|^IS\d{24}$|^IQ\d{2}[0-9A-Z]{4}\d{15}$|^IE\d{2}[A-Z]{4}\d{14}$|^IL\d{21}$|^IT\d{2}[A-Z]\d{10}[0-9A-Z]{12}$|^KW\d{2}[A-Z]{4}22!$|^LV\d{2}[A-Z]{4}[0-9A-Z]{13}$|^LB\d{6}[0-9A-Z]{20}$|^LI\d{7}[0-9A-Z]{12}$|^LT\d{18}$|^LU\d{5}[0-9A-Z]{13}$|^MK\d{5}[0-9A-Z]{10}\d{2}$|^MT\d{2}[A-Z]{4}\d{5}[0-9A-Z]{18}$|^MR13\d{23}$|^MU\d{2}[A-Z]{4}\d{19}[A-Z]{3}$|^MC\d{12}[0-9A-Z]{11}\d{2}$|^ME\d{20}$|^NL\d{2}[A-Z]{4}\d{10}$|^QA\d{2}[A-Z]{4}\d{21}$|^LC\d{2}[A-Z]{4}\d{24}$|^SC\d{2}[A-Z]{4}\d{20}\d[A-Z]{3}$|^NO\d{13}$|^TL\d{21}$|^ST\d{23}$|^PL\d{26}$|^PT\d{23}$|^RO\d{2}[A-Z]{4}[0-9A-Z]{16}$|^SM\d{2}[A-Z]\d{10}[0-9A-Z]{12}$|^SA\d{4}[0-9A-Z]{18}$|^RS\d{20}$|^SK\d{22}$|^SI\d{17}$|^ES\d{22}$|^SE\d{22}$|^CH\d{7}[0-9A-Z]{12}$|^TN59\d{20}$|^TR\d{7}[0-9A-Z]{17}$|^AE\d{21}$|^GB\d{2}[A-Z]{4}\d{14}$/;
        const basicReg = /^[0-9A-Za-z]{6,35}$/;
        const stringTest = /^[A-Za-z]{2}/;
        if ((stringTest.test(field.value) && !reg.test(field.value)) || (!stringTest.test(field.value) && !basicReg.test(field.value))) {
          return { valid: false, message: this.translate.get('xjson.enter_valid_iban') };
        }
      }

      if (field.type === 'idcode') {
        const reg = /^\d{11}$/;
        if (!reg.test(field.value)) {
          return { valid: false, message: this.translate.get('xjson.enter_valid_idcode') };
        }
      }
    }
    return { valid: true, message: 'valid' };
  }

  /*
  * Returns 1 if the IBAN is valid 
  * Returns FALSE if the IBAN's length is not as should be (for CY the IBAN Should be 28 chars long starting with CY )
  * Returns any other number (checksum) when the IBAN is invalid (check digits do not match)
  * https://stackoverflow.com/a/35599724
  */
  isValidIBANNumber(input: string) {
    var CODE_LENGTHS = {
      AD: 24, AE: 23, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
      CH: 21, CR: 22, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, ES: 24,
      FI: 18, FO: 18, FR: 27, GB: 22, GI: 23, GL: 18, GR: 27, GT: 28, HR: 21,
      HU: 28, IE: 22, IL: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28,
      LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27,
      MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29,
      RO: 24, RS: 22, SA: 24, SE: 24, SI: 19, SK: 24, SM: 27, TN: 24, TR: 26,   
      AL: 28, BY: 28, EG: 29, GE: 22, IQ: 23, LC: 32, SC: 31, ST: 25, SV: 28,
      TL: 23, UA: 29, VA: 22, VG: 24, XK: 20
    };
    const iban = String(input).toUpperCase().replace(/[^A-Z0-9]/g, ''); // keep only alphanumeric characters
    let code = iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/); // match and capture (1) the country code, (2) the check digits, and (3) the rest
    let digits: string;
    // check syntax and length
    if (!code || iban.length !== CODE_LENGTHS[code[1]]) {
      return false;
    }
    // rearrange country code and check digits, and convert chars to ints
    digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, (letter) => {
      return String(letter.charCodeAt(0) - 55);
    });
    // final check
    return this.mod97(digits);
  }

  mod97(input: string) {
    let checksum = Number(input.slice(0, 2));
    let fragment: string;
    for (let offset = 2; offset < input.length; offset += 7) {
      fragment = String(checksum) + input.substring(offset, offset + 7);
      checksum = parseInt(fragment, 10) % 97;
    }
    return checksum;
  }

  onFieldBlur(element) {
    if (this.data_elements?.[element]?.type === 'iban') {
      const reg = /^EE\d{18}$/;
      const ibanKey = `iban-valid-${element}`;
      const value = this.data_elements[element].value;
      this.alertsService.clear(ibanKey);

      if (value && (!reg.test(value) || this.isValidIBANNumber(value) !== 1)) {
        this.alertsService.warning(this.translate.get('xjson.check_iban'), ibanKey, undefined, true);

        if (!this.setAlerts.includes(ibanKey)) {
          this.setAlerts.push(ibanKey);
        }
      }
    }
  }

  showTableAddRow(element) {
    if (element.add_del_rows && !this.isFieldDisabled(element.readonly)) {
      if (element.value && !element.value.length) {
        return true;
      }
      if (!element.value) {
        return true;
      }

      const elementColumns: any = Object.values(element.table_columns);

      if (element.value && element.value.length &&
        elementColumns.length === 1 && elementColumns[0].required) {
        const validationElement = elementColumns[0];
        const val = element.value[element.value.length - 1];
        validationElement.value = val[Object.keys(val)[0]];

        const validation = this.isValidField(validationElement);

        return validation.valid;
      }
      return true;

    }
  }

  tableValidation(table) {
    let valid = true;
    let validationResult = { valid };
    const validationRows = [];

    if ((!table.value || !table.value.length)) {
      return table.required ?
        { valid: false, message: this.translate.get('xjson.missing_required_value') } :
        { valid: true, message: 'valid' };
    }
    for (const row of table.value) {
      for (const col of Object.keys(row)) {
        const column_properties = JSON.parse(JSON.stringify(table.table_columns[col]));
        column_properties.value = row[col];

        const validation = this.isValidField(column_properties);
        if (!validation.valid) {
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
      if (elements[field].type === 'table' && !this.isFieldHidden(field)) {
        const validation = this.tableValidation(elements[field]);
        if (!validation.valid) {
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
        if (!validation.valid) {
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
    this.alertsService.clear('upperAlert');

    if (activity === 'EDIT') {
      this.promptEditConfirmation();
    } else if (activity === 'CHANGE') {
      this.formLoading = true;
      const payload = { form_name: this.form_route, activity: 'CHANGE' };
      this.getData(payload);
    } else {
      this.formLoading = true;
      const activities = this.data.header.acceptable_activity;

      if ((activity === 'SAVE' && activities.includes('SAVE') && !activities.includes('SUBMIT'))
        || (activity !== 'SAVE' && activities.includes('SAVE') && activities.includes('SUBMIT'))
        || activity === 'CONTINUE'
        || activity === 'SUBMIT') {
        this.validateForm(this.data_elements);
      }

      if (Object.keys(this.error).length === 0) {
        this.edit_step = false;
        this.error_alert = false;
        this.data.header['activity'] = activity;
        const payload = { form_name: this.form_route, form_info: this.data };
        if (activity === 'SAVE') {
          this.saved = true;
        }
        this.scrollPositionController();
        if (this.test) {
          this.promptDebugDialog(payload);
        } else {
          this.getData(payload);
        }

        this.setAlerts.forEach((alertId) => this.alertsService.clear(alertId));
        this.setAlerts.length = 0;
      } else {
        this.edit_step = this.edit_step ? true : false;
        this.error_alert = true;
        this.alertsService.error(this.translate.get('xjson.validation_errors'), 'upperAlert', false);
        this.formLoading = false;
        this.scrollPositionController();
      }
    }
  }

  errorHandler(message) {}

  closeError() {
    this.error_alert = false;
  }

  closeMessage(i) {
    this.data_messages.splice(i, 1);
  }

  selectStep(step) {
    if (step === this.opened_step) {
      return; // to nothing
    }
    if (this.isStepDisabled(step)) {
      return this.errorHandler('This step is disabled');
    }
    this.opened_step = step;
    this.viewController(this.data);

  }

  editableStep() {
    return this.data.body.steps[this.opened_step].editable;
  }

  setActivityButtons(activities: string[]) {
    const output = { primary: [], secondary: [] };
    const editableActivities = ['SUBMIT', 'SAVE', 'CONTINUE'];
    if (this.data.body.steps[this.opened_step].sequence < this.data.body.steps[this.max_step].sequence
      && !this.edit_step) {
      if (this.editableStep()) {
        if (editableActivities.some(editable => this.isItemExisting(activities, editable))) {
          output['primary'].push({ label: 'xjson.edit', action: 'EDIT', style: 'primary' });
        }
      }
    } else if (this.data.header.acceptable_activity.includes('CHANGE')) {
      output['primary'].push({ label: 'xjson.edit', action: 'EDIT', style: 'primary' });
    } else {
      activities.forEach((activity) => {
        if (editableActivities.includes(activity)) {
          if (activity === 'SAVE' && activities.includes('SAVE') && activities.includes('SUBMIT')) {
            output['primary'].push({
              label: 'button.save_draft',
              action: activity,
              style: 'primary',
            });
          } else {
            output['primary'].push({
              label: `button.${activity.toLowerCase()}`,
              action: activity,
              style: 'primary',
            });
          }
        }
      });
    }
    return output;
  }

  cancelEventHandler() {
    this.location.back();
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
            params.push(`${key}=${strings[key]}`);
          }
        }
      },
    );
    const urlParams = params.join('&');

    this.acceptable_forms.forEach((elem, index) => {
      const path = `${this.settings.url}/xjson_service/form_path/${elem.form_name}`;
      this.http.get(path).subscribe((response: any) => {
        if (response.path) {
          this.acceptable_forms[index].link = `${response.path}?${urlParams}`;
        }
      });
    });

  }

  toggleAcceptableFormList() {
    this.acceptable_forms_list_restricted = !this.acceptable_forms_list_restricted;
    this.compileAcceptableFormList();
  }

  getUpperInfoText() {
    const infoTextTranslationKey = `xjson.${this.form_name}_infotext`;
    const infoTextTranslation = this.translate.get(infoTextTranslationKey);
    this.upperInfoText = infoTextTranslation.replace(/[?]/g, '') === infoTextTranslationKey ? false : infoTextTranslation;
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
    }
    if (!Object.keys(xjson['body']['steps']).some(step => step === xjson['header']['current_step'])) {
      this.max_step = Object.keys(xjson['body']['steps'])[0];
    } else {
      this.max_step = xjson['header']['current_step'];
    }
  }

  populateAlerts() {
    this.alertsService.clear('upperAlert');
    this.data_messages.forEach((element) => {
      const message = this.data.messages[element];
      if ((message.message_code || message.message_text) && message.message_type) {
        const messageText: string = message.message_code ? this.translate.get(`xjson.${message.message_code}`) : message.message_text?.et;
        this.alertsService[message.message_type === 'NOTICE' ? 'info' : message.message_type.toLowerCase()](messageText, 'upperAlert', false, true);
      }
    });
  }

  getData(inputData) {

    let data = { ...inputData };
    if (this.test) {
      data.test = true; // TEST
    }

    if (this.queryStrings) {
      data = { ...data, ...this.queryStrings };
    }

    const subscription = this.http.post(`${this.settings.url}/xjson_service?_format=json`, data)
      .subscribe((response) => {

        if (!response['header']) {
          return this.errorHandler('Missing header from response');
        }
        if (!response['body']) {
          return this.errorHandler('Missing body from response');
        }
        if (!response['body']['steps']) {
          return this.errorHandler('Missing body.steps from response');
        }

        if (response['body']['steps'].length === 0) {
          this.empty_data = true;
        }

        if (response['header']['current_step']) {
          this.setMaxStep(response);
        }

        if (response['header']['form_name'] && (response['header']['acceptable_activity'].includes('CHANGE')
        || data.activity && data.activity === 'CHANGE')) {
          this.form_name = response['header']['form_name'];
          const path = `${this.settings.url}/xjson_service/form_path/${this.form_name}`;
          this.http.get(path).subscribe((response: any) => {
            if (response.path) {
              this.form_route = response.path;
            }
          });
        }

        if (response['header']['acceptable_activity']) {
          if ((!(response['header']['acceptable_activity'] instanceof Array))) {
            return this.errorHandler('Acceptable activity is a string!');
          }
          this.current_acceptable_activity = response['header']['acceptable_activity'];

          const acceptableActivityIncludesTarget = this.current_acceptable_activity.some((key) => {
            return ['SUBMIT', 'SAVE', 'CONTINUE'].includes(key);
          });

          if (acceptableActivityIncludesTarget && !response['header']['current_step']) {
            return this.errorHandler('Missing "current_step" while "acceptable_activity" is SUBMIT, SAVE or CONTINUE');
          }
        }

        this.stepController(response);

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
    this.formKey = this.data.header.form_name.substr(0, this.data.header.form_name.indexOf('_'));
    if (typeof this.opened_step !== 'undefined') {
      this.data_elements = this.data.body.steps[this.opened_step].data_elements;
      // Concat. all message arrays and display them at all times
      if (this.data.body.messages && this.data.body.steps[this.opened_step].messages) {
        this.data_messages = [...this.data.body.messages, ...this.data.body.steps[this.opened_step].messages];
      }
    } else {
      this.data_messages = this.data.body.messages;
    }

    if (this.data_messages) {
      this.populateAlerts();
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

      /**
       * TODO: Move to BE or tunnel (lõime)
       * Hiding "OLT" form and data_elements if:
       * "hide_steps" === true (no navigation)
       * no values in data_elements value arrays
       */
      this.dataElementsHaveValues = !!Object.values(this.data_elements).find(elem => elem['value']?.length);
      if (!this.dataElementsHaveValues && this.data.body.hide_steps && this.form_name.includes('OLT')) {
        this.formVisible = false;
      }

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

      this.fillInAds();
      this.getStepViewStatus();
      this.formLoading = false;
    }
  }

  fillInAds() {
    try {
      if (this.data_elements.aadressid) {
        this.data_elements.aadressid.value.forEach((item, index) => {
          const oid = item.aadress.adsOid;
          const params = `ihist=1&features=EHAK,EHITISHOONE&appartment=1&adsoid=${oid}&results=10&callback=JSONP_CALLBACK`;
          const path = `https://inaadress.maaamet.ee/inaadress/gazetteer?${params}`;
          const subscription = this.http.jsonp(path, 'callback').subscribe((response: any) => {
            this.data_elements.aadressid.value[index].aadress = this.addressService.inAdsFormatValue(response.addresses[0]);
          });
        });
      }
    } catch (err) {
    }
  }

  ngOnInit() {
    this.path = decodeURI(this.location.path().split('?')[0]);
    this.form_route = decodeURI(this.router.url).split('?')[0];
    this.lang = this.settings.currentAppLanguage,
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
