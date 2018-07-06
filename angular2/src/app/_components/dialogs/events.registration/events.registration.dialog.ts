import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {FormControl, FormBuilder, FormGroup, Validators} from '@angular/forms';


@Component({
  selector: 'events-registration-dialog',
  templateUrl: 'events.registration.dialog.html',
  styleUrls: ['../modal/modal.scss']
})
export class EventsRegistratonDialog {
  
  form: FormGroup;
  
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  telephone: string;
  marked: string;
  step: number = 0;
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EventsRegistratonDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
  
  
  ngOnInit() {

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
    this.step = 1
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
