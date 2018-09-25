import {Component, Inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'modal',
  templateUrl: 'modal.html',
  styleUrls: ['modal.scss']

})

export class Modal {

  constructor(

    constructor(
    private router: Router,
    private route: ActivatedRoute,
    public dialogRef: MatDialogRef<Modal>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ){}
  
  ngOnInit() {


  }  
  
  closeModal() {
    this.dialogRef.close();
  }
  
}
