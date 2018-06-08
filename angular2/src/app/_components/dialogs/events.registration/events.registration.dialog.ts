import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'events-registration-dialog',
  templateUrl: 'events.registration.dialog.html',
})
export class EventsRegistratonDialog {
  
  form: FormGroup;
  
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  telephone: string;
  marked: string;
  
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
    this.form.valueChanges.subscribe(
      (data) => {
        console.log(this.form.controls)
      }
    )
  }  
  
  save() {
    if(this.form.valid) {
      this.dialogRef.close(this.form.value);
    } else {
      console.log(this.form)
    }
  }
  
  close() {
    this.dialogRef.close();
  }
  
  clear() {
    this.form.reset();
  }

  isInvalidFirstname(): boolean {
    if(this.form.controls.firstName.invalid && (this.form.controls.firstName.dirty || this.form.controls.firstName.touched)) {
      return true
    }
    return false
  }
  isInvalidLastname(): boolean {
    if(this.form.controls.lastName.invalid && (this.form.controls.lastName.dirty || this.form.controls.lastName.touched)) {
      return true
    }
    return false
  }
  isInvalidEmail(): boolean {
    if(this.form.controls.email.invalid && (this.form.controls.email.dirty || this.form.controls.email.touched)) {
      return true
    }
    return false
  }
}
