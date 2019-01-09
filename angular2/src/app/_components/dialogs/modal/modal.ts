import {Component, Inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RootScopeService } from '@app/_services';
import { Router } from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'modal',
  templateUrl: 'modal.html',
  styleUrls: ['modal.scss']

})

export class Modal {

  dashboardLink: string = "";


    constructor(
      private rootScope: RootScopeService,
      private router: Router,
    public dialogRef: MatDialogRef<Modal>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ){}
  
  ngOnInit() {
    let lang = this.rootScope.get('lang');
    this.dashboardLink = 'töölaud/taotlused';
  }  
  
  closeModal() {
    this.dialogRef.close();
  }
  
}
