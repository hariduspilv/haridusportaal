import { Component } from '@angular/core';
import { RootScopeService } from '@app/_services';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material';
import { HttpService } from '@app/_services/httpService';
import { SettingsService } from '@app/_services/settings.service';

@Component({
  selector: 'search-modal',
  templateUrl: 'search.modal.html',
  styleUrls: ['../modal/modal.scss', 'search.modal.scss']
})

export class SearchModal {

  constructor(
    private router: Router,
    private http: HttpService,
    private settings: SettingsService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<SearchModal>
  ){}

  ngOnInit() {}

  closeModal() {
    this.dialogRef.close();
  }
  
}
