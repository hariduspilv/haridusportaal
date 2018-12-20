import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {FormControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { SettingsService } from '@app/_core/settings';
import { HttpService } from '@app/_services/httpService';
@Component({
  selector: 'events-registration-dialog',
  templateUrl: 'events.registration.dialog.html',
  styleUrls: ['../modal/modal.scss']
})
export class EventsRegistratonDialog {
  
  form: FormGroup;
  iCalUrl = "";
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  telephone: string;
  marked: string;
  step: number = 0;
  lang: any;
  loader: boolean = false;
  response: any;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EventsRegistratonDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public router: Router,
    public route: ActivatedRoute,
    public settings: SettingsService,
    private http: HttpService
  ) { }
  
  
  ngOnInit() {

    let tmpDates = {};
    for( var i in this.data.eventExtraDates ){
      let unix = parseInt( this.data.eventExtraDates[i].entity.fieldEventDate.unix );
      tmpDates[unix] = this.data.eventExtraDates[i];
    }

    let outputDates = [];
    for( var i in tmpDates ){
      outputDates.push( tmpDates[i] );
    }

    this.data.eventExtraDates = outputDates;

    this.iCalUrl = this.settings.url+"/calendarexport/"+this.data.nid;

    this.form = this.fb.group({
      firstName: [this.firstName, [Validators.required]],
      lastName: [this.lastName, [Validators.required]],
      companyName: [this.companyName, []],
      telephone: [this.telephone, []],
      email: [this.email, [Validators.required, Validators.email]],
      marked: [this.marked, []]
    });
    // this.form.valueChanges.subscribe()
  }  
  
  save() {
    this.loader = true;

    let data = { 
      queryId: "cfad8e08bfdf881d6c7c6533744dc5eb20d3d160:1",
      variables: {
        event_id: this.data.nid,
        lang: this.data.lang.toUpperCase(),
        firstName: this.form.controls.firstName ? this.form.controls.firstName.value : false,
        lastName: this.form.controls.lastName ? this.form.controls.lastName.value : false,
        companyName: this.form.controls.companyName ? this.form.controls.companyName.value : false,
        telephone: this.form.controls.telephone ? this.form.controls.telephone.value : false,
        email: this.form.controls.email ? this.form.controls.email.value : false,
        marked: this.form.controls.marked ? this.form.controls.marked.value : false
      }
    }

    const register = this.http.post('/graphql', data).subscribe((response) => {
      let data = response['data'];

      /*
        ERROR MESSAGES
        1 => "No more free spaces"
        2 => "Something else"
      */

      this.response = data['createEventRegistration'];
      this.step = 1;
      this.loader = false;
    }, (data) => {
      this.loader = false;
    });
  }
  
  close() {
    this.dialogRef.close();
  }
  
  clear() {
    this.form.reset();
  }

  isInvalidField(field): boolean {
    return this.form.controls[field].invalid && this.form.controls[field].value && this.form.controls[field].dirty
  }
}
