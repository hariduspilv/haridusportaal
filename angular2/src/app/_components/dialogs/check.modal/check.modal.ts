import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpService } from '@app/_services/httpService';
import { RootScopeService } from '@app/_services';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '@app/_services/userService';

@Component({
  selector: 'check-modal',
  templateUrl: 'check.modal.html',
  styleUrls: ['../modal/modal.scss']

})

export class CheckModal {
  
  content: any = false;
  loading: boolean = false;
  error: boolean = false;
  errorMessage: any = false;
  public roleSelection: string = '';
  public initialRole: string = '';
  public codeSelection: number;

  constructor(public dialogRef: MatDialogRef<CheckModal>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpService,
    private rootScope: RootScopeService,
    private translate: TranslateService,
    private userService: UserService
  ){}
  
  ngOnInit() {
    this.rootScope.set('roleChanged', false);
    this.codeSelection = this.data.userData['role']['current_role']['data'] ? this.data.userData['role']['current_role']['data']['reg_kood'] : null;
    this.roleSelection = this.data.userData['role']['current_role']['type'];
    if (this.roleSelection === 'juridical_person') {
      this.roleSelection = "juridical-"+this.codeSelection;
    } 
    this.initialRole = this.roleSelection;
    this.loading = true;
    let sub = this.http.get(this.data.contentUrl).subscribe(response => {
      if(response['error']){
        this.loading = false;
        this.error = true;
        if (response['error']['message_text']) {
          this.errorMessage = response['error']['message_text'];
        }
      } else {
        this.content = response['value']['ettevotted'];
        this.loading = false;
        sub.unsubscribe();
      }
    }, error => {
      this.loading = false;
      this.error = true;
    });
  }  

  setRole() {
    let data = {
      type: this.roleSelection,
      id: this.codeSelection
    }
    let sub = this.http.post('/custom/login/setRole', data).subscribe(response => {
      if (response['token']) {
        this.userService.storeData(response['token']);
      }
      sub.unsubscribe();
      this.rootScope.set('roleChanged', true);
      this.dialogRef.close();
    }, (err) => {
      if (err['message'] || err['error']['message']) {
        this.error = true
        this.errorMessage = err['error']['message'] || err['message'];
      }
    });
  }

  roleChange() {
    if (this.initialRole !== this.roleSelection) {
      if (this.roleSelection.includes('-')) {
        this.roleSelection = this.roleSelection.split('-')[0];
      }
      this.setRole();
    } else {
      this.closeModal();
    }
  }

  closeModal() {
    this.dialogRef.close();
  }
  
}
