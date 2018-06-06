import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'events-registration-dialog',
  templateUrl: 'events.registration.dialog.html',
})
export class EventsRegistratonDialog {

  constructor(
    public dialogRef: MatDialogRef<EventsRegistratonDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
