import { Component, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { Subscription } from '../../../../node_modules/rxjs';
import { HttpService } from '@app/_services/httpService';
import { Router, ActivatedRoute } from '@angular/router';
import { RootScopeService } from '@app/_services/rootScopeService';

@Component({
  templateUrl: './xjson.template.html',
  styleUrls: ['./xjson.styles.scss']
})
export class XjsonComponent implements OnInit, OnDestroy{
 
  public objectKeys = Object.keys;

  public lang: string;
  public form_name: string;
  public subscriptions: Subscription[] = [];

  public data;
  public opened_step;
  public current_acceptable_activity
  public data_elements;
  public navigationLinks;

  constructor(
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
        output.push({label: 'previous_page', step: previous});
      }
    }
    if(list[list.length-1] != opened) {
      let next = list[list.indexOf(opened) + 1]
      if(this.isStepDisabled(next) === false){
        output.push({label: 'next_page', step: next});
      }
    }

    return output;
  }

  isStepDisabled(step): boolean {
   
    let steps = Object.keys(this.data.body.steps);

    let isBeforeCurrentStep = steps.indexOf(step) < steps.indexOf(this.opened_step) ? true: false;
    let isAfterCurrentStep = steps.indexOf(step) > steps.indexOf(this.opened_step) ? true: false;
    //let isCurrentStep = this.opened_step === step ? true: false;

    if(isBeforeCurrentStep === true) {
      return false;
    } else if(isAfterCurrentStep === true) {
      let isNextToCurrentStep = (steps.indexOf(this.opened_step) + 1) === steps.indexOf(step) ? true : false;

      if(this.current_acceptable_activity.includes('CONTINUE')){
        if(isNextToCurrentStep === true) return false;
        else return true;

      } else if (this.current_acceptable_activity.includes('VIEW')){
        return false;

      } else return true;
      
    } else {
      return false;
    }    
  }

  submitForm(activity: string){
    
    //this.data.header["activity"] = "SUBMIT";
    //this.data form => "value": []
  }

  errorHandler(message){
    console.log('ERROR: ', message);
  }

  selectStep(step){
    if(step === this.opened_step) return this.errorHandler('This step is already selected');
    else {
      if(this.isStepDisabled(step)) return this.errorHandler('This step is disabled');
      this.opened_step = step;
      this.viewController(this.data)
    }
  }

  viewController(xjson){
    this.data = xjson;
    
    this.data_elements = this.data.body.steps[this.opened_step].data_elements;

    if(this.data_elements){
      this.navigationLinks = this.setNavigationLinks(Object.keys(this.data.body.steps), this.opened_step);
      
    } else {
      let payload = {form_name: this.form_name, form_info: xjson}
    
      this.getData(payload)
    }

  }

  stepController(xjson){

    if(xjson.header.current_step === null) {
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

  getData(data){
    let subscribe = this.http.post('/xjson_service?_format=json', data).subscribe(response => {
      console.log(response);
      if(!response['header']) return this.errorHandler('Missing header from response');
      if(!response['body']) return this.errorHandler('Missing body from response');
      if(!response['body']['steps']) return this.errorHandler('Missing body.steps from response');

      //response['header']['current_step'] = 'step_3'
      //response['header']['acceptable_activity'] = ['SAVE'];

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