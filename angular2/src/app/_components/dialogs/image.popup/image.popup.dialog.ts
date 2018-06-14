import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'image-popup-dialog',
  templateUrl: 'image.popup.dialog.html',
  styleUrls: ['image.popup.dialog.scss']
})
export class ImagePopupDialog {
  constructor(
    public dialogRef: MatDialogRef<ImagePopupDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  close() {
    this.dialogRef.close();
  }
}
