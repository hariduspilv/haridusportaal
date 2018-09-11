import { Component, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { Subscription } from '../../../../node_modules/rxjs';
import { HttpService } from '@app/_services/httpService';
import { Router, ActivatedRoute } from '@angular/router';
import { RootScopeService } from '@app/_services/rootScopeService';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmPopupDialog } from '@app/_components/dialogs/confirm.popup/confirm.popup.dialog';

@Component({
  templateUrl: './xjson.template.html',
  styleUrls: ['./xjson.styles.scss']
})
export class XjsonComponent implements OnInit, OnDestroy{
 
  public objectKeys = Object.keys;

  public lang: string;
  public form_name: string;
  public subscriptions: Subscription[] = [];
  public dialogRef: MatDialogRef<ConfirmPopupDialog>;

  public data;
  public opened_step;
  public max_step;
  public current_acceptable_activity
  public data_elements;
  public navigationLinks;
  public activityButtons;
  public error = {};

  constructor(
    private translate: TranslateService,
    public dialog: MatDialog,
    private rootScope: RootScopeService,
    private http: HttpService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  setPaths() {
    this.rootScope.set('langOptions', {
      'en': '/en/xjson/' + this.form_name,
      'et': '/et/xjson/' + this.form_name
    });
  }

  pathWatcher() { 
    let subscribe = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.form_name = params['form_name']
        this.lang = params['lang'];

        this.setPaths();
      }
    );

    this.subscriptions = [...this.subscriptions, subscribe];
  }

  promptEditConfirmation() {
		 this.dialogRef = this.dialog.open(ConfirmPopupDialog, {
		  data: {
        content: this.translate.get('xjson.edit_step_confirm_modal_content')['value'],
        confirm: this.translate.get('button.yes')['value'],
        cancel: this.translate.get('button.cancel')['value'],
		  }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if(result == true) {
        this.data.header.current_step = this.opened_step;
        this.data.header["activity"] = 'SAVE';
        let payload = {form_name: this.form_name, form_info: this.data}
        this.getData(payload);
      }
      this.dialogRef = null;
    });

  }
  isItemExisting(list, target): boolean{
    return list.some(item => item == target);
  }

  selectLanguage(obj: object){
    if(obj[this.lang]) return obj[this.lang];
    else return obj['et'];
  }

  setNavigationLinks(list, opened): {}[]{
    if(list.length == 0) return [];
    let output: {}[] = []

    if(list[0] != opened) {
      let previous = list[list.indexOf(opened) - 1]
      if(this.isStepDisabled(previous) === false){
        output.push({label: 'button.previous', step: previous});
      }
    }
    if(list[list.length-1] != opened) {
      let next = list[list.indexOf(opened) + 1];
      if(this.isStepDisabled(next) === false){
        output.push({label: 'button.next', step: next});
      }
    }
    return output;
  }

  isStepDisabled(step): boolean {
    let max_step = this.max_step;
    let steps = Object.keys(this.data.body.steps);
    let isAfterCurrentStep = steps.indexOf(step) > steps.indexOf(max_step) ? true: false;
   
    if (this.current_acceptable_activity.includes('VIEW')){
      return false;

    } else if(isAfterCurrentStep === true) {
      return true;

    } else {
      return false;
    }    
  }
  isValidField(field){  
    //check for required field

    if(field.required === true){
      if(field.value === undefined) return {valid: false, message: 'Puudub kohustuslik väärtus'}
      //else if (field.value.length == 0) return {valid: false, message: 'Puudub kohustuslik väärtus'}
    }
    //check for minlength
    if(field.minlength !== undefined){
      if(field.value.length < field.minlength) return {valid: false, message: 'Väärtuse minimaalne lubatud pikkus on ' + field.minlength }
    }
    //check for maxlength
    if(field.maxlength !== undefined){
      if(field.value.length > field.maxlength) return {valid: false, message: 'Väärtuse maksimaalne lubatud pikkus on ' + field.maxlength }
    }
    //check for min
    if(field.min !== undefined){
      if(field.value < field.min) return {valid: false, message: 'Minimaalne lubatud väärtus on ' + field.min }
    }
    //check for max
    if(field.max !== undefined){
      if(field.value > field.max) return {valid: false, message: 'Maximaalne lubatud väärtus on ' + field.max }
    }
    //check for email format
    if(field.type === 'email'){
      let reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if(reg.test(field.value) === false) return {valid: false, message: 'Palun sisesta sobilik email' }
    }
    return {valid: true, message:'valid'};
  }
  tableValidation(table){
    /*
    {
      "value": [
        {
          "institution_id": 61,
          "institution_name": "Tartu Ülikool",
          "type": "511 bakalaureuseõpe (vv alates 01.06.2002)",
          "type_coded": 12508,
          "study_programme": "Loodusteadused ja tehnoloogia",
          "study_programme_EHISid": 144918,
          "start_date": 1504396800000,
          "learning_load": "täiskoormusega õpe",
          "learning_load_code": 14473,
          "completion_rate": 0,
          "academic_leave_start": null,
          "first_semester_end": null
        }
      ],
      "type": "table",
      "title": {
        "et": "Õpingute andmed andmed"
      },
      "add_del_rows": false
    } */
    //let validation = this.isValidField(elements[field]);
   
    for (let row of table.value) {
      //console.log(row);
      for (let col of Object.keys(row)) {
        let column_properties = table.table_columns[col];
        column_properties.value = row[col];

        let validation = this.isValidField(column_properties);
        if(validation.valid != true){
          validation['row'] = table.value.indexOf(row);
          validation['column'] = col;
         return validation;
        }
      }
    }
    
    return {valid: true, message: 'valid'}
  }

  validateForm(elements){
  
    const NOT_FOR_VALIDATION = ['heading']
    for(let field in elements) {
      if(elements[field].type == 'table'){
        let validation = this.tableValidation(elements[field]);
        if(validation.valid !== true) {
          console.log(validation);
          return this.error[field] = validation;
        }
      }
      else if(!NOT_FOR_VALIDATION.includes(elements[field].type)){

        let validation = this.isValidField(elements[field]);

        if(validation.valid !== true) {
          console.log(validation.message);
          return this.error[field] = validation;
        }
      }
    };
  }
  submitForm(activity: string){
    this.error = {};

    if(activity == 'EDIT') {
      
      this.promptEditConfirmation();
      
    } else {
      this.validateForm(this.data_elements);

      if(Object.keys(this.error).length == 0){
        //console.log('Would submit form with this.data.header["activity"]= ', activity)
        this.data.header["activity"] = activity;
        //console.log(this.data);
        let payload = {form_name: this.form_name, form_info: this.data};
        this.getData(payload);
      }
    }
  }

  errorHandler(message){
    console.log('ERROR: ', message);
  }

  selectStep(step){
    if(step === this.opened_step) {
      return this.errorHandler('This step is already selected');
    } else {
      if(this.isStepDisabled(step)){
        return this.errorHandler('This step is disabled');
      }
      this.opened_step = step;
      this.viewController(this.data)
    }
  }

  setActivityButtons(activities: string[]): {}[]{
    let output = [];
    let editableActivities = ['SUBMIT', 'SAVE', 'CONTINUE'];
    let nonButtonActivities = ['VIEW'];
    if(this.opened_step < this.max_step){
      let displayEditButton = editableActivities.some(editable => this.isItemExisting(activities, editable));
      if(displayEditButton) output.push({label: 'button.edit' , action: 'EDIT', style: 'secondary'})

    } else {
      activities.forEach(activity => {
        if(!nonButtonActivities.includes(activity)) {
          output.push({label: 'button.' + activity.toLowerCase() , action: activity, style: 'primary'})
        }
      })
    }
    return output
  }

  getData(data){
    let test = true;
    if(test) {
      data.test = true; //TEST
      if(this.data != undefined){
        if(this.data.header.activity != undefined) {
          console.log('Changing current_step locally');
          this.stepController(JSON.parse(JSON.stringify(data)))
        }
      }
    }

    let subscribe = this.http.post('/xjson_service?_format=json', data).subscribe(response => {
      console.log(response);
      if(!response['header']) return this.errorHandler('Missing header from response');
      if(!response['body']) return this.errorHandler('Missing body from response');
      if(!response['body']['steps']) return this.errorHandler('Missing body.steps from response');

      if(test === true){
        response['header']['current_step'] = 'step_3' //testing
        response['header']['acceptable_activity'] = ['SAVE','SUBMIT']; //testing
      }

      if(response['header']['current_step']) {
        this.max_step = response['header']['current_step'];
      }
      if(response['header']['acceptable_activity']){
        this.current_acceptable_activity = response['header']['acceptable_activity'];
       
        let acceptableActivityIncludesTarget = this.current_acceptable_activity.some(key => {
          return ['SUBMIT','SAVE','CONTINUE'].includes(key);
        })
        if(acceptableActivityIncludesTarget && !response['header']['current_step']){
          return this.errorHandler('Missing current_step while acceptable_activity is SUBMIT, SAVE or CONTINUE')
        }
      }
     
      this.stepController(response)

      subscribe.unsubscribe();
    });

  }

  stepController(xjson){

    if(xjson.header.current_step === null || xjson.header.current_step === undefined) {
      if(Object.keys(xjson.body.steps).length === 0) return this.errorHandler('No steps available');

      this.opened_step = Object.keys(xjson.body.steps)[0];
      
    } else if (!this.opened_step){
      if(this.isItemExisting(Object.keys(xjson.body.steps), xjson.header.current_step)){
        this.opened_step = xjson.header.current_step;
      } else {
        this.errorHandler('Missing current_step from body.steps array')
      }
    }

    this.viewController(xjson);
  }

  viewController(xjson){
    this.data = xjson;
    
    this.data_elements = this.data.body.steps[this.opened_step].data_elements;

    if(!this.data_elements){
      let payload = {form_name: this.form_name, form_info: xjson}
      this.getData(payload)
     
    } else {
      this.navigationLinks = this.setNavigationLinks(Object.keys(this.data.body.steps), this.opened_step);
      this.activityButtons = this.setActivityButtons(this.data.header.acceptable_activity)
    }

  }

  ngOnInit(){
    this.pathWatcher();

    this.getData({form_name: this.form_name});

  };

  ngOnDestroy(){
    /* Clear all subscriptions */
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  };

};