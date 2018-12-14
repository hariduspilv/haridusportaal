import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpService } from '@app/_services/httpService';
import { RootScopeService } from '@app/_services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'table-modal',
  templateUrl: 'table.modal.html',
  styleUrls: ['../modal/modal.scss']

})

export class TableModal {
  
  content: any = false;
  loading: boolean = false;
  error: boolean = false;
  errorMessage: any = false;
  fieldTranslations = [];

  constructor(public dialogRef: MatDialogRef<TableModal>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpService,
    private rootScope: RootScopeService,
    private translate: TranslateService
  ){}
  
  ngOnInit() {
    this.loading = true;
    let sub = this.http.get(this.data.contentUrl).subscribe(response => {
      if(response['error']){
        this.loading = false;
        this.error = true;
        if (response['error']['message_text']) {
          this.errorMessage = response['error']['message_text'];
        }
      } else {
        
        this.data.fields.forEach((field) => {
          let translationLink = this.data.fieldsTranslationSrc[field];
          this.fieldTranslations.push(this.translate.get(translationLink)['value']);
        });
        
        this.content = response['value']['isikuandmed'];

        this.loading = false;
        sub.unsubscribe();
      }
    }, error => {
      this.loading = false;
      this.error = true;
    });
  }  
  
  closeModal() {
    this.dialogRef.close();
  }
  
}
