import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'confirm-popup-dialog',
  templateUrl: './confirm.popup.dialog.html',
  styleUrls: ['../modal/modal.scss']
})

export class ConfirmPopupDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmPopupDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  
}
