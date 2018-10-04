import { Component, OnInit, OnDestroy} from '@angular/core';
import { Subscription } from '../../../../node_modules/rxjs';
import { HttpService } from '@app/_services/httpService';
import { Jsonp } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { RootScopeService } from '@app/_services/rootScopeService';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmPopupDialog } from '@app/_components/dialogs/confirm.popup/confirm.popup.dialog';
import { TableService } from '@app/_services/tableService';
import { SettingsService } from '@app/_core/settings'
import 'rxjs/add/operator/map';
import {Observable} from "rxjs/Rx";

import * as _moment from 'moment';
const moment = _moment;
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material";
import { MomentDateAdapter } from '@angular/material-moment-adapter';

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
  templateUrl: './xjson.template.html',
  styleUrls: ['./xjson.styles.scss'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: XJSON_DATEPICKER_FORMAT},
  ]
})
export class XjsonComponent implements OnInit, OnDestroy {

  tableOverflown: boolean = false;
  elemAtStart: boolean = true;
  

  public objectKeys = Object.keys;
  public test: boolean;
  public lang: string;
  public form_name: string;
  public subscriptions: Subscription[] = [];
  public dialogRef: MatDialogRef<ConfirmPopupDialog>;
  public datepickerFocus: boolean = false;

  public data;
  public opened_step;
  public max_step;
  public current_acceptable_activity: string[];
  public data_elements;
  public navigationLinks;
  public activityButtons;
  public error = {};

  public autoCompleteContainer = {};
  public autocompleteDebouncer;
  public autocompleteSubscription: Subscription;
  public autocompleteLoader: boolean = true;

  constructor(
    private translate: TranslateService,
    public dialog: MatDialog,
    private rootScope: RootScopeService,
    private http: HttpService,
    private _jsonp: Jsonp,
    private route: ActivatedRoute,
    private router: Router,
    private tableService: TableService,
    public settings: SettingsService
  ) {}

  setPaths() {
    this.rootScope.set('langOptions', {
      'en': '/en/xjson/' + this.form_name,
      'et': '/et/xjson/' + this.form_name
    });
  }

  pathWatcher() { 
    let params = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.form_name = params['form_name']
        this.lang = params['lang'];

        this.setPaths();
      }
    );
    let strings = this.route.queryParams.subscribe(
      (strings: ActivatedRoute) => {
        this.test = (strings['test'] === 'true');

        this.setPaths();
      }
    );

    this.subscriptions = [...this.subscriptions, params];
    this.subscriptions = [...this.subscriptions, strings];
  }
 
  setDatepickerValue(event, element, rowindex, col){
    
    if(this.datepickerFocus === false){
      
      if(rowindex == undefined || col == undefined){
        if(event instanceof FocusEvent){
          let string = JSON.parse(JSON.stringify(event.target['value']))
          let date = moment(string).format('DD.MM.YYYY')
          this.data_elements[element].value = JSON.parse(JSON.stringify(moment(date).format('YYYY-MM-DD')));
        } else {
          this.data_elements[element].value = JSON.parse(JSON.stringify(event.value.format('YYYY-MM-DD')));
        }       
      } else {
        if(event instanceof FocusEvent){
          let string = JSON.parse(JSON.stringify(event.target['value']))
          let date = moment(string).format('DD.MM.YYYY')
          this.data_elements[element].value[rowindex][col] = JSON.parse(JSON.stringify(moment(date).format('YYYY-MM-DD')));
        } else {
          this.data_elements[element].value[rowindex][col] = JSON.parse(JSON.stringify(event.value.format('YYYY-MM-DD')));
        } 
        
      }
    }
  }
  getDatepickerValue(element, rowindex, col){
    if(rowindex == undefined|| col == undefined){
      return this.data_elements[element].value
    } else {
      return this.data_elements[element].value[rowindex][col];
    }
   
  }
  selectListCompare(a, b) {
    return a && b ? a == b : a == b;
  }
  isFieldDisabled(readonly): boolean{
    if(readonly === true) {
      return true;

    } else if (this.max_step != this.opened_step){
      return true;

    } else if(this.current_acceptable_activity.some(key => ['SUBMIT','SAVE'].includes(key))){
      return false;

    } else {
      return true;
    }
  }
  
  parseAcceptableExtentsions(list: string[]) {
    if(!list) {
      return '*/*';
    } else {
      return list.map(extentsion => '.'+ extentsion).join(',')
    }
  }
  
  fileDownloadlink(id){
    let token = localStorage.getItem('token');
    return this.settings.url + '/xjson_service/documentFile/' + id + '?jwt_token=' + token;
  }

  canUploadFile(element): boolean{
    
    var singeFileRestrictionApplies = (element.multiple === false && element.value.length > 0);
  
    if(this.isFieldDisabled(element.readonly)){
      return false;
    } else if(singeFileRestrictionApplies){
      return false;
    } else {
      return true;
    }
  }
 
  fileDelete(id, model){
    let target = model.value.find(file => file.file_identifier === id);
    model.value.splice(model.value.indexOf(target), 1);
  }
  
  fileEventHandler(e, element){
    e.preventDefault();
    let files = e.target.files || e.dataTransfer.files;
    let model = this.data_elements[element];

    if(files && files.length > 0) {
      for(let file of files) {
        let reader = new FileReader();
        console.log(file.name);
        reader.readAsDataURL(file);
        reader.onload = () => {
          let payload = {
            file: reader.result.split(',')[1],
            form_name: this.form_name,
            data_element: element
          }
          let subscription = this.http.fileUpload('/xjson_service/documentFile', payload).subscribe(response => {
            console.log(response);
            let new_file = {
              file_name: file.name,
              file_identifier: response['id']
            };
            model.value.push(new_file)
  
            subscription.unsubscribe();
          });
        };
      }
    }
  }
  tableColumnName(element, index){
    return Object.keys(this.data_elements[element].table_columns)[index];
  }
  tableColumnAttribute(element, index, attribute){
    return this.data_elements[element].table_columns[ this.tableColumnName(element, index) ][attribute]
  }
  tableAddRow(element): void{
    let table = this.data_elements[element];
    let newRow = {};

    for(let col in table.table_columns){
      let column = table.table_columns[col];
      if(column.default_value != undefined) {
        newRow[col] = column.default_value;
      } else {
        newRow[col] = null;
      }
    }
    table.value.push(newRow);
  }
  
  tableDeleteRow(element, rowIndex) {
    this.dialogRef = this.dialog.open(ConfirmPopupDialog, {
     data: {
       content: this.translate.get('xjson.table_delete_row_confirm_modal_content')['value'],
       confirm: this.translate.get('button.yes')['value'],
       cancel: this.translate.get('button.cancel')['value'],
     }
   });
   this.dialogRef.afterClosed().subscribe(result => {
     if(result === true) {
      this.data_elements[element].value.splice(rowIndex, 1);
     }
     this.dialogRef = null;
   });
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
        if(this.test === true) this.promptDebugDialog(payload)
        else this.getData(payload);
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
      //else if (!field.value) return {valid: false, message: 'Puudub kohustuslik väärtus'}
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
      if(field.required === true){
        let reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(reg.test(field.value) === false) return {valid: false, message: 'Palun sisesta sobilik email' }
      }
    }
    return {valid: true, message:'valid'};
  }
  tableValidation(table){
    for (let row of table.value) {
      //console.log(row);
      for (let col of Object.keys(row)) {
        let column_properties = JSON.parse(JSON.stringify(table.table_columns[col]));
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
    console.log(this.data_elements);
    if(activity == 'EDIT') {
      
      this.promptEditConfirmation();
      
    } else {
      this.validateForm(this.data_elements);

      if(Object.keys(this.error).length == 0){
        //console.log('Would submit form with this.data.header["activity"]= ', activity)
        this.data.header["activity"] = activity;
        //console.log(this.data);
        let payload = {form_name: this.form_name, form_info: this.data};
        if(this.test === true) this.promptDebugDialog(payload)
        else this.getData(payload);
      }
    }
  }

  errorHandler(message){
    console.log('DEBUG_ERROR: ', message);
    alert('DEBUG_ERROR: ' + message);
  }

  selectStep(step){
    if(step === this.opened_step) {
      return //to nothing
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
      if(displayEditButton) output.push({label: 'button.edit' , action: 'EDIT', style: 'primary'})

    } else {
      activities.forEach(activity => {
        if(!nonButtonActivities.includes(activity)) {
          output.push({label: 'button.' + activity.toLowerCase() , action: activity, style: 'primary'})
        }
      })
    }
    return output
  }

  promptDebugDialog(data) {
   
    if(this.test === false){
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
      if(result == true) {
        
        this.getData(data);
      }
      this.dialogRef = null;
    });

  }
  setMaxStep(xjson){
   
    if(!Object.keys(xjson['body']['steps']).length){
      //Any steps available?
      return this.errorHandler('No steps available');
      
    } else if(Object.keys(xjson['body']['steps']).some(step => step == xjson['header']['current_step']) == false){
       //current step does not exist?
      this.max_step = Object.keys(xjson['body']['steps'])[0];
    } else {

      this.max_step = xjson['header']['current_step'];
    }
    
  }
  getData(data){
    
    if(this.test) {
      data.test = true; //TEST
      //alert(JSON.stringify(data));

    }
    
    let subscription = this.http.post('/xjson_service?_format=json', data).subscribe(response => {
      console.log(response);
      if(!response['header']) return this.errorHandler('Missing header from response');
      if(!response['body']) return this.errorHandler('Missing body from response');
      if(!response['body']['steps']) return this.errorHandler('Missing body.steps from response');

      if(response['header']['current_step']) {
        this.setMaxStep(response);
      }

      if(response['header']['acceptable_activity']){
        if((!(response['header']['acceptable_activity'] instanceof Array))) {
          return this.errorHandler('Acceptable activity is a string!');
        }
        this.current_acceptable_activity = response['header']['acceptable_activity'];
       
        let acceptableActivityIncludesTarget = this.current_acceptable_activity.some(key => {
          return ['SUBMIT','SAVE','CONTINUE'].includes(key);
        })
      
        if(acceptableActivityIncludesTarget && !response['header']['current_step']){
          return this.errorHandler('Missing "current_step" while "acceptable_activity" is SUBMIT, SAVE or CONTINUE')
        }
      }
     
      this.stepController(response)

      subscription.unsubscribe();
    });

  }

  stepController(xjson){
   
    this.opened_step = this.max_step;

    this.viewController(xjson);
  }


  viewController(xjson){
    

    this.data = xjson;
    this.data_elements = this.data.body.steps[this.opened_step].data_elements;

    if(!this.data_elements){
      let payload = {form_name: this.form_name, form_info: xjson}
     
      if(this.test === true) this.promptDebugDialog(payload)
      else this.getData(payload)
     
    } else {
      this.navigationLinks = this.setNavigationLinks(Object.keys(this.data.body.steps), this.opened_step);
      this.activityButtons = this.setActivityButtons(this.data.header.acceptable_activity)
      this.scrollPositionController();
    }
   
  }
  
  addressAutocompleteSelectionValidation(element){
    console.log(this.autoCompleteContainer[element]);
    let condition = this.autoCompleteContainer[element].some(address => {
      return address.pikkaadress === this.data_elements[element].value
    })
    console.log(condition);
    if(!condition) this.data_elements[element].value = "";
    
  }
  addressAutocomplete(searchText: string, debounceTime: number = 300, element) {
   
    if(searchText.length < 3) return;

    this.autocompleteLoader = true;

    if(this.autocompleteDebouncer) clearTimeout(this.autocompleteDebouncer)
    
    if(this.autocompleteSubscription) this.autocompleteSubscription.unsubscribe();
  
    let _this = this;

    this.autocompleteDebouncer = setTimeout(function(){

      let jsonp = _this._jsonp.get('http://inaadress.maaamet.ee/inaadress/gazetteer?address=' + searchText + '&callback=JSONP_CALLBACK')
      .map(function(res){
        return res.json() || {};
      }).catch(function(error: any){return Observable.throw(error)});
    
      _this.autocompleteSubscription = jsonp.subscribe(data => {
        if(data['error']) console.log('Something went wrong with In-ADS request')

        _this.autocompleteLoader = false;
        _this.autoCompleteContainer[element] = data['addresses'] || [];
        _this.autocompleteSubscription.unsubscribe();
        console.log( _this.autoCompleteContainer[element]);
      })  

    }, debounceTime)

  }
  
  scrollPositionController(){
    let _opened_step = this.opened_step;
    setTimeout(function(){
      if(_opened_step){
        try { 
          document.querySelector('#' + _opened_step).scrollIntoView({ block: 'end',  behavior: 'smooth' });
        } catch (e) {
          document.querySelector('#' + _opened_step).scrollIntoView();
        }
  
        if(window.pageYOffset > 0){
         
          try { 
            window.scrollTo({left: 0, top: 0, behavior: 'smooth' });
          } catch (e) {
            window.scrollTo(0, 0);
          }
          try { 
            document.querySelector('#' + _opened_step).scrollIntoView({ block: 'end',  behavior: 'smooth' });
          } catch (e) {
            document.querySelector('#' + _opened_step).scrollIntoView();
          }
          
        }
      }
    }, 0)
  }
  

  ngOnInit(){
    this.pathWatcher();
    let payload = {form_name: this.form_name}

    if(this.test === true) {
      this.promptDebugDialog(payload)
    } else {
      this.getData(payload);
    }
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