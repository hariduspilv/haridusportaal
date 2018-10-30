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

  public tableOverflown: any = { 
    0:true,1:true
  };
  public elemAtStart: any = {
    0:true,1:true
  };
  

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
        this.test = (strings['test'] == 'true');
        if(strings['draft'] == 'true') this.queryStrings['status'] = 'draft'
        if(strings['existing'] == 'true') this.queryStrings['status'] = 'submitted';
        if(strings['identifier'] != undefined ) this.queryStrings['id'] = Number(strings['identifier']);

        this.setPaths();
      }
    );

    this.subscriptions = [...this.subscriptions, params];
    this.subscriptions = [...this.subscriptions, strings];
  }

  fillAddressFieldsTemporaryModel(data_elements){
    Object.keys(data_elements).forEach(element => {
     
      if(data_elements[element].type === 'address' && data_elements[element].value){

        if(typeof data_elements[element].value === 'object'){
          if(data_elements[element].value.addressHumanReadable) {
            this.autoCompleteContainer[element] = [data_elements[element].value];
            this.temporaryModel[element] = JSON.parse(JSON.stringify(data_elements[element].value.addressHumanReadable));
      
          } else {
            data_elements[element].value = null;
          }
        } else if (typeof data_elements[element].value === 'string'){
          this.temporaryModel[element] = JSON.parse(JSON.stringify(data_elements[element].value));
          this.addressAutocomplete(data_elements[element].value, 0, element, true);
        }
      }
    });
  }

  validateInAdsField(element){
    if(this.addressFieldFocus === false){
      this.addressAutocompleteSelectionValidation(element)
    }
  }

  addressAutocompleteSelectionValidation(element){

    if(this.autoCompleteContainer[element] ===  undefined) {
      console.log('this.autoCompleteContainer[element] === undefined')
      return this.temporaryModel[element] = null;
    }   

    let match = this.autoCompleteContainer[element].find(address => {
      return address.addressHumanReadable == this.temporaryModel[element]
    })
   
    if(!match) {
      this.autoCompleteContainer[element] = null;
      this.temporaryModel[element] = null;
      this.data_elements[element].value = null;
    }
    else {
      this.data_elements[element].value = this.inAdsFormatValue(match)
    }

  }

  addressAutocomplete(searchText: string, debounceTime: number = 300, element, autoselectOnMatch: boolean = false) {
    if(searchText.length < 3) return;

    

    if(this.autocompleteDebouncer[element]) clearTimeout(this.autocompleteDebouncer[element])
    
    if(this.autocompleteSubscription[element] !== undefined) {
      this.autocompleteSubscription[element].unsubscribe();
    }
  
    let _this = this;
    let limit = this.data_elements[element].results || 10;
    let ihist = this.data_elements[element].ihist || 0;
    let apartment = this.data_elements[element].appartment || 0;
    
    this.autocompleteDebouncer[element] = setTimeout(function(){
      _this.autocompleteLoader = true;
      let url = 'http://inaadress.maaamet.ee/inaadress/gazetteer?ihist='+ ihist +'&appartment='+ apartment +'&address=' + searchText + '&results='+ limit + '&callback=JSONP_CALLBACK';
      let jsonp = _this._jsonp.get(url).map(function(res){
        return res.json() || {};
      }).catch(function(error: any){return Observable.throw(error)});
    
      _this.autocompleteSubscription[element] = jsonp.subscribe(data => {
        if(data['error']) console.log('Something went wrong with In-ADS request')

        _this.autocompleteLoader = false;
        _this.autoCompleteContainer[element] = data['addresses'] || [];

        _this.autoCompleteContainer[element] = _this.autoCompleteContainer[element].filter(address => (address.kood6 != '0000' || address.kood7 != '0000'))
        
        _this.autoCompleteContainer[element].forEach(address => {
          if(address.kort_nr){
            address.addressHumanReadable = address.pikkaadress + '-' + address.kort_nr;
          } else {
            address.addressHumanReadable = address.pikkaadress;
          }
        })

        if(autoselectOnMatch === true){
          _this.addressAutocompleteSelectionValidation(element);
        }

        _this.autocompleteSubscription[element].unsubscribe();
      })  

    }, debounceTime)

  }

  inAdsFormatValue(address){
    if(address.apartment != undefined) return address;

    return {
      "adr_id" : address.adr_id,
      "ads_oid" : address.ads_oid,
      "addressCoded" : address.koodaadress,
      "county" : address.maakond,
      "countyEHAK" : address.ehakmk,
      "localGovernment" : address.omavalitsus,
      "localGovernmentEHAK" : address.ehakov,
      "settlementUnit" : address.asustusyksus,
      "settlementUnitEHAK" : address.ehak,
      "address" : address.aadresstekst,
      "apartment" : address.kort_nr,
      "addressHumanReadable" : address.addressHumanReadable
      }
  }

  scrollPositionController(){
    let _opened_step = this.opened_step;
    if(_opened_step){
      setTimeout(function(){
        var step_navigation_container = document.getElementById('stepNavigation');
        var opened_step_element = document.getElementById(_opened_step);
        
        let parent_center = step_navigation_container.offsetWidth / 2;
        let button_center = opened_step_element.offsetWidth / 2;
        var position_left = (step_navigation_container.offsetLeft - opened_step_element.offsetLeft + parent_center - button_center) * -1;

        if(window.pageYOffset > 0){
          try { 
            window.scrollTo({left: 0, top: 0, behavior: 'smooth' });
          } catch (e) {
            window.scrollTo(0, 0);
          }
          navScroller();
          
        } else {
          navScroller();
        }
        function navScroller(){
          try { 
            step_navigation_container.scrollTo({left: position_left,  behavior: 'smooth' });
          } catch (e) {
            step_navigation_container.scrollTo(position_left, 0);
          }
        }
     
      }, 0)
    }
  }

  setDatepickerValue(event, element, rowindex, col){
    
    if(this.datepickerFocus === false){
      
      if(rowindex == undefined || col == undefined){
        if(event instanceof FocusEvent){
          let string = JSON.parse(JSON.stringify(event.target['value']))
          let date = moment(string.split('.').reverse().join('-')).format('YYYY-MM-DD');
          if(date == 'Invalid date') {
            this.data_elements[element].value = null;
            event.target['value'] = null;
          } else {
            this.data_elements[element].value = JSON.parse(JSON.stringify(date));
          } 
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
        
        reader.readAsDataURL(file);
        reader.onload = () => {
          let payload = {
            file: reader.result.split(',')[1],
            form_name: this.form_name,
            data_element: element
          }
          let subscription = this.http.fileUpload('/xjson_service/documentFile', payload).subscribe(response => {
            
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
       title: this.translate.get('xjson.table_delete_row_confirm_modal_title')['value'],
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
        title: this.translate.get('xjson.edit_step_confirm_modal_title')['value'],
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
        output.push({label: 'button.previous', step: previous, 'type':'link'});
      }
    }
    if(list[list.length-1] != opened) {
      let next = list[list.indexOf(opened) + 1];
      if(this.isStepDisabled(next) === false){
        output.push({label: 'button.next', step: next, 'type':'link'});
      }
    }
    return output;
  }

  isStepDisabled(step): boolean {
    let max_step = this.max_step;
    let steps = Object.keys(this.data.body.steps);
    let isAfterCurrentStep = steps.indexOf(step) > steps.indexOf(max_step) ? true: false;
   
    if (this.current_acceptable_activity.includes('VIEW') && !isAfterCurrentStep){
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
      if(field.value === undefined) return {valid: false, message: this.translate.get('xjson.missing_required_value')['value']}
      //else if (!field.value) return {valid: false, message: 'Puudub kohustuslik väärtus'}
    }
    //check for minlength
    if(field.minlength !== undefined){
      if(field.value.length < field.minlength) return {valid: false, message: this.translate.get('xjson.value_min_length_is')['value'] + ' ' + field.minlength }
    }
    //check for maxlength
    if(field.maxlength !== undefined){
      if(field.value.length > field.maxlength) return {valid: false, message: this.translate.get('xjson.value_max_length_is')['value'] + ' ' + field.maxlength }
    }
    //check for min
    if(field.min !== undefined){
      if(field.required === true){
        if(field.value < field.min) return {valid: false, message: this.translate.get('xjson.min_value_is')['value'] + ' ' + field.min }
      }
    }
    //check for max
    if(field.max !== undefined){
      if(field.required === true){
        if(field.value > field.max) return {valid: false, message: this.translate.get('xjson.max_value_is')['value'] + ' ' + field.max }
      }
    }
    //check for email format
    if(field.type === 'email'){
      if(field.required === true){
        let reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(reg.test(field.value) === false) return {valid: false, message: this.translate.get('xjson.enter_valid_email')['value']  }
      }
    }
    return {valid: true, message:'valid'};
  }
  tableValidation(table){
    for (let row of table.value) {
      
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
        
        this.data.header["activity"] = activity;
        
        let payload = {form_name: this.form_name, form_info: this.data};
        if(this.test === true) this.promptDebugDialog(payload)
        else this.getData(payload);
      }
    }
  }

  errorHandler(message){
    console.log('DEBUG_ERROR: ', message);
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

  setActivityButtons(activities: string[]){
    let output = {primary: [], secondary: []};
    let editableActivities = ['SUBMIT', 'CONTINUE'];
    let maxStepActions = [{action: 'SAVE', label: 'button.save_draft'}]
    if(this.opened_step < this.max_step){

      let displayEditButton = editableActivities.some(editable => this.isItemExisting(activities, editable));
      if(displayEditButton) output['primary'].push({label: 'button.edit' , action: 'EDIT', style: 'primary'})

    } else {
      activities.forEach(activity => {
        if(editableActivities.includes(activity)) {
          output['primary'].push({label: 'button.' + activity.toLowerCase() , action: activity, style: 'primary'})
        }
      });
      maxStepActions.forEach(button => {
        if(activities.some(activity => button.action == activity)) {
          output['secondary'].push({label: button.label , action: button.action})
        }    
      });
    }
    return output;
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
      return this.errorHandler('No steps available');
    } else if(Object.keys(xjson['body']['steps']).some(step => step == xjson['header']['current_step']) == false){
      this.max_step = Object.keys(xjson['body']['steps'])[0];
    } else {
      this.max_step = xjson['header']['current_step'];
    }
  }

  getData(data){
    
    if(this.test) {
      data.test = true; //TEST

    }
    
    if(this.queryStrings){
      data = {...data , ... this.queryStrings};
    }

    let subscription = this.http.post('/xjson_service?_format=json', data ).subscribe(response => {
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

    //Concat. all message arrays and display them at all times
    this.data_messages = [...this.data.body.messages, ...this.data.body.steps[this.opened_step].messages];
    
    if(!this.data_elements){
      let payload = {form_name: this.form_name, form_info: xjson}
     
      if(this.test === true) this.promptDebugDialog(payload)
      else this.getData(payload)

    } else {
      this.navigationLinks = this.setNavigationLinks(Object.keys(this.data.body.steps), this.opened_step);

      this.activityButtons = this.setActivityButtons(this.data.header.acceptable_activity)
      
      this.fillAddressFieldsTemporaryModel(this.data_elements);

      this.scrollPositionController();
    }
  }

  ngOnInit(){
    this.pathWatcher();
    let payload = {form_name: this.form_name}

    if(this.test === true) {
      this.promptDebugDialog(payload)
    } else {
      //TODO: create catcher to prevent endless loop requests...
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