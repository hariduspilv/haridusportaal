import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'taraLogin-modal',
  templateUrl: 'taraLogin.modal.html',
  styleUrls: ['../modal/modal.scss']

})

export class taraLoginModal {

  url: SafeResourceUrl;

  constructor(
    public dialogRef: MatDialogRef<taraLoginModal>,
    public sanitizer:DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any
  ){}
  
  ngOnInit() {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.data);
  }  

  closeModal() {
    this.dialogRef.close();
  }
  
}
