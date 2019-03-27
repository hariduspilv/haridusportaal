import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpService } from '@app/_services/httpService';
import { RootScopeService, NotificationService } from '@app/_services';
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
    private translate: TranslateService,
    private notificationService: NotificationService,
  ){}
  
  ngOnInit() {
    this.loading = true;
    let sub = this.http.get(this.data.contentUrl).subscribe((response: any) => {
      console.log(response);
      if(response.error){

        this.loading = false;
        this.error = true;
        const currentLang = this.rootScope.get('lang');
        this.notificationService.error(response.error.message_text[currentLang], 'personal_data', false);
      } else {
        
        try{
          this.data.fields.forEach((field) => {
            this.fieldTranslations.push(this.translate.get(`frontpage.${field}`)['value']);
          });
        }catch(err){
          console.log(err);
          this.notificationService.error('errors.personal_data_missing', 'personal_data', false);

        }
        
        this.content = response.value.isikuandmed;

        this.loading = false;
        sub.unsubscribe();
      }
    }, error => {

      this.loading = false;
      this.error = true;
      this.notificationService.error('errors.personal_data_request', 'personal_data', false);
    });
  }  
  
  closeModal() {
    this.dialogRef.close();
  }
  
}
