import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { HttpService } from '@app/_services/httpService';
import { SettingsService } from '@app/_services/settings.service';
import { UserService } from '@app/_services/userService';
import { NotificationService, RootScopeService } from '@app/_services';
import { Jsonp } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmPopupDialog } from '@app/_components/dialogs/confirm.popup/confirm.popup.dialog';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { throwError } from 'rxjs';
import { MAT_DATE_FORMATS } from "@angular/material";
import * as moment from 'moment';

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
  templateUrl: 'xjsonForm.template.html',
  styleUrls: ['../xjson/xjson.styles.scss'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: XJSON_DATEPICKER_FORMAT },
  ]
})

export class XjsonFormComponent implements OnInit, OnDestroy {

  public view = 'document';

  public elemAtStart: any = {};

  public objectKeys = Object.keys;
  public test: boolean;
  public queryStrings = {};

  public lang: string;
  public form_name: string;
  public subscriptions: Subscription[] = [];
  public dialogRef: MatDialogRef<ConfirmPopupDialog>;
  public datepickerFocus: boolean = false;
  public temporaryModel = {};
  public data;
  public opened_step;
  public max_step;
  public current_acceptable_activity: string[];
  public data_elements;
  public data_messages;
  public navigationLinks;
  public subButtons;
  public activityButtons;
  public error = {};
  public loginError: boolean = false;
  public userLoggedOut: boolean = false;

  public autoCompleteContainer = {};
  public autocompleteDebouncer = {};
  public autocompleteSubscription = {};
  public autocompleteLoader: boolean = true;
  public addressFieldFocus: boolean = false;

  constructor(
    private translate: TranslateService,
    public dialog: MatDialog,
    private rootScope: RootScopeService,
    private http: HttpService,
    private _jsonp: Jsonp,
    private route: ActivatedRoute,
    private router: Router,
    public settings: SettingsService,
    private notificationService: NotificationService,
    private user: UserService
  ) {
  }

  pathWatcher() {
    let params = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.form_name = params['form_name']
        this.lang = params['lang'];
      }
    );
    let strings = this.route.queryParams.subscribe(
      (strings: ActivatedRoute) => {
        this.test = (strings['test'] == 'true');
        if (strings['draft'] == 'true') this.queryStrings['status'] = 'draft'
        if (strings['existing'] == 'true') this.queryStrings['status'] = 'submitted';
        if (strings['identifier'] != undefined) this.queryStrings['id'] = Number(strings['identifier']);
      }
    );

    this.subscriptions = [...this.subscriptions, params];
    this.subscriptions = [...this.subscriptions, strings];
  }

  changeView(key) {
    this.view = key;
  }

  scrollPositionController() {

    let _opened_step = this.opened_step;
    if (_opened_step) {

      setTimeout(function () {
        var step_navigation_container = document.getElementById('stepNavigation');
        var opened_step_element = document.getElementById(_opened_step);

        let parent_center = step_navigation_container.offsetWidth / 2;
        let button_center = opened_step_element.offsetWidth / 2;
        var position_left = (step_navigation_container.offsetLeft - opened_step_element.offsetLeft + parent_center - button_center) * -1;

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

      }, 0)
    }
  }

  setDatepickerValue(event, element) {
     if (this.datepickerFocus === false) {
      if (event instanceof FocusEvent) {
        let date = moment(event.target['value'], 'DD.MM.YYYY').format('L');
        if(date == 'Invalid date') {
          this.data_elements[element].value = null;
          event.target['value'] = null;
        } else {
          this.data_elements[element].value = event.target['value'].format('L');
        }
      } else {
        this.data_elements[element].value = event.value.format('L');
      }
    }
  }

  checkboxChange(event, element){
    this.data_elements[element].value = event.checked ? 'true' : 'false';
  }

  selectListCompare(a, b) { 
    return a && b ? a == b : a == b;
  }
  isFieldDisabled(readonly): boolean {
    if (readonly === true) {
      return true;

    } else if (this.max_step != this.opened_step) {
      return true;

    } else if (this.current_acceptable_activity.some(key => ['SUBMIT', 'SAVE'].includes(key))) {
      return false;

    } else {
      return true;
    }
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
      if (result == true) {
        this.data.header.current_step = this.opened_step;
        this.data.header["activity"] = 'SAVE';
        let payload = { form_name: this.form_name, form_info: this.data }
        if (this.test === true) this.promptDebugDialog(payload)
        else this.getData(payload);
      }
      this.dialogRef = null;
    });
  }

  isItemExisting(list, target): boolean {
    return list.some(item => item == target);
  }

  selectLanguage(obj: object) {
    if (obj[this.lang]) return obj[this.lang];
    else return obj['et'];
  }

  setNavigationLinks(list, opened): {}[] {
    if (list.length == 0) return [];
    let output: {}[] = []

    if (list[0] != opened) {
      let previous = list[list.indexOf(opened) - 1]
      if (this.isStepDisabled(previous) === false) {
        output.push({ label: 'button.previous', step: previous, 'type': 'link' });
      }
    }
    if (list[list.length - 1] != opened) {
      let next = list[list.indexOf(opened) + 1];
      if (this.isStepDisabled(next) === false) {
        output.push({ label: 'button.next', step: next, 'type': 'link' });
      }
    }
    return output;
  }

  isStepDisabled(step): boolean {
    let max_step = this.max_step;
    let steps = Object.keys(this.data.body.steps);
    let isAfterCurrentStep = steps.indexOf(step) > steps.indexOf(max_step) ? true : false;

    if (this.current_acceptable_activity.includes('VIEW') && !isAfterCurrentStep) {
      return false;

    } else if (isAfterCurrentStep === true) {
      return true;

    } else {
      return false;
    }
  }
  isValidField(field) {
    //check for required field
    if (field.required === true) {
      if (field.value === undefined || field.value === null) return { valid: false, message: this.translate.get('xjson.missing_required_value')['value'] }
    }
    if (typeof field.value !== 'undefined') {
      //check for minlength
      if (field.minlength !== undefined && field.value !== "") {
        if (field.value.length < field.minlength) return { valid: false, message: this.translate.get('xjson.value_min_length_is')['value'] + ' ' + field.minlength }
      }
      //check for maxlength
      if (field.maxlength !== undefined && field.value !== "") {
        if (field.value.length > field.maxlength) return { valid: false, message: this.translate.get('xjson.value_max_length_is')['value'] + ' ' + field.maxlength }
      }
      //check for min
      if (field.min !== undefined) {
        if (field.type === 'date') {
          if (moment(field.value).isBefore(field.min)) {
            return { valid: false, message: this.translate.get('xjson.min_value_is')['value'] + ' ' + moment(field.min).format('DD.MM.YYYY') }
          }
        } else if (field.value < field.min) {
          return { valid: false, message: this.translate.get('xjson.min_value_is')['value'] + ' ' + field.min }
        }
      }
      //check for max
      if (field.max !== undefined) {
        if (field.type === 'date') {
          if (moment(field.value).isAfter(field.max)) {
            return { valid: false, message: this.translate.get('xjson.max_value_is')['value'] + ' ' + moment(field.max).format('DD.MM.YYYY') }
          }
        } else if (field.value > field.max) {
          return { valid: false, message: this.translate.get('xjson.max_value_is')['value'] + ' ' + field.max };
        }
      }
      //check for email format
      if (field.type === 'email') {
        let reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (reg.test(field.value) === false) return { valid: false, message: this.translate.get('xjson.enter_valid_email')['value'] }
      }
    }
    return { valid: true, message: 'valid' };
  }

  validateForm(elements): void {
    const NOT_FOR_VALIDATION = ['heading', 'helpertext',]

    for (let field in elements) {
      let element = elements[field];
      if (!NOT_FOR_VALIDATION.includes(element.type)) {
        let validation = this.isValidField(element);
        if (validation.valid !== true) {
          this.error[field] = validation;
          break;
        }
      }
    };
  }

  submitForm(activity: string) {
    this.error = {};

    if (activity == 'EDIT') {
      this.promptEditConfirmation();
    } else {
      this.validateForm(this.data_elements);

      if (Object.keys(this.error).length == 0) {
        this.data.header["activity"] = activity;
        let payload = { form_name: this.form_name, form_info: this.data };
        if (this.test === true) {
          this.promptDebugDialog(payload)
        } else {
          this.getData(payload);
        }
      }
    }
  }

  errorHandler(message) {
    console.log('DEBUG_ERROR: ', message);
  }

  closeMessage(i) {
    this.data_messages.splice(i, 1);
  }

  selectStep(step) {
    if (step === this.opened_step) {
      return //to nothing
    } else {
      if (this.isStepDisabled(step)) {
        return this.errorHandler('This step is disabled');
      }
      this.opened_step = step;
      this.viewController(this.data)
    }
  }

  setActivityButtons(activities: string[]) {
    let output = { primary: [], secondary: [] };
    let editableActivities = ['SUBMIT', 'CONTINUE'];
    let maxStepActions = [{ action: 'SAVE', label: 'button.save_draft' }]
    if (this.opened_step < this.max_step) {

      let displayEditButton = editableActivities.some(editable => this.isItemExisting(activities, editable));
      if (displayEditButton) output['primary'].push({ label: 'button.edit', action: 'EDIT', style: 'primary' })

    } else {
      activities.forEach(activity => {
        if (editableActivities.includes(activity)) {
          output['primary'].push({ label: 'button.' + activity.toLowerCase(), action: activity, style: 'primary' })
        }
      });
      maxStepActions.forEach(button => {
        if (activities.some(activity => button.action == activity)) {
          output['secondary'].push({ label: button.label, action: button.action })
        }
      });
    }
    return output;
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
        cancel: "Katkesta"
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result == true) {

        this.getData(data);
      }
      this.dialogRef = null;
    });

  }

  setMaxStep(xjson) {
    if (!Object.keys(xjson['body']['steps']).length) {
      return this.errorHandler('No steps available');
    } else if (Object.keys(xjson['body']['steps']).some(step => step == xjson['header']['current_step']) == false) {
      this.max_step = Object.keys(xjson['body']['steps'])[0];
    } else {
      this.max_step = xjson['header']['current_step'];
    }
  }

  getData(data) {

    if (this.test) {
      data.test = true; //TEST
    }

    if (this.queryStrings) {
      data = { ...data, ... this.queryStrings };
    }

    let subscription = this.http.post('/xjson_service?_format=json', data).subscribe(response => {

      if (!response['header']) return this.errorHandler('Missing header from response');
      if (!response['body']) return this.errorHandler('Missing body from response');
      if (!response['body']['steps']) return this.errorHandler('Missing body.steps from response');

      if (response['header']['current_step']) {
        this.setMaxStep(response);
      }

      if (response['header']['acceptable_activity']) {
        if ((!(response['header']['acceptable_activity'] instanceof Array))) {
          return this.errorHandler('Acceptable activity is a string!');
        }
        this.current_acceptable_activity = response['header']['acceptable_activity'];

        let acceptableActivityIncludesTarget = this.current_acceptable_activity.some(key => {
          return ['SUBMIT', 'SAVE', 'CONTINUE'].includes(key);
        })

        if (acceptableActivityIncludesTarget && !response['header']['current_step']) {
          return this.errorHandler('Missing "current_step" while "acceptable_activity" is SUBMIT, SAVE or CONTINUE')
        }
      }
      this.stepController(response)

      subscription.unsubscribe();
    }, err => {
      this.loginError = true;
      this.notificationService.error(err.error, 'xjsonForm', false);
    });

  }

  stepController(xjson) {
    this.opened_step = this.max_step;
    this.viewController(xjson);
  }


  viewController(xjson) {
    this.elemAtStart = {};
    this.data = xjson;
    this.data_elements = this.data.body.steps[this.opened_step].data_elements;

    this.data_messages = this.data.body.steps[this.opened_step].messages;

    if (!this.data_elements) {
      let payload = { form_name: this.form_name, form_info: xjson }

      if (this.test === true) this.promptDebugDialog(payload)
      else this.getData(payload)

    } else {

      this.navigationLinks = this.setNavigationLinks(Object.keys(this.data.body.steps), this.opened_step);

      this.activityButtons = this.setActivityButtons(this.data.header.acceptable_activity)

      this.scrollPositionController();
    }
  }

  ngOnInit() {
    this.userLoggedOut = this.user.getData()['isExpired'];
    this.pathWatcher();
    let payload = { form_name: this.form_name }

    if (this.test === true) {
      this.promptDebugDialog(payload)
    } else {
      //TODO: create catcher to prevent endless loop requests...
      this.getData(payload);
    }
  };

  ngOnDestroy() {
    /* Clear all subscriptions */
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  };
};