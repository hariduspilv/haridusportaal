import { Component, OnDestroy, ViewChild, OnInit, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SettingsService } from '@app/_services/settings.service';
import { RootScopeService } from '@app/_services';

@Component({
  templateUrl: './personalData.component.html'
})

export class PersonalDataComponent {

  content: any;
  error: boolean;
  submitCounter: number;
  status: string;
  statusText: string;
  loading: boolean;
  token: string;

  constructor(
    private snackbar: MatSnackBar,
    public viewContainerRef: ViewContainerRef,
    private http: HttpClient,
    private settings: SettingsService,
    private rootScope: RootScopeService
    ) {

    let that = this;
    this.submitCounter = 0;
    this.error = false;

    this.content = {
      error: []
    };

    let tokenUrl = this.settings.url+"/"+this.rootScope.get("lang")+"/rest/session/token";

    var headers = new Headers();
    headers.set('Content-Type', 'text/html');


    this.http.get(tokenUrl, {
      responseType: "text"
    })
    .subscribe(data => {
      that.token = data;
    }, error => {

    });
  }

  changeValue(form, value:any): void{
    form.personalCode = value;
    this.submit(form);
  }

  submit(form:any): void{

    let that = this;
    let endPoint = this.settings.url+"/personal-card?_format=json";

    let regex = new RegExp(/([1,3,4,5,6]\d{10})$/);
    let personalCode = form.personalCode || "false";

    this.status = "default";
    this.statusText = "";
    this.content = [];

    if( this.loading ){
      this.snackbar.open('Ära rapsi.. Ma ju laen veel..', 'OK', {
        duration: 3000
      });

    }
    else if( !personalCode.match(regex) ){
      this.status = "error";
      this.statusText = "Isikukood ei ole õiges formaadis";
    }else{

      this.loading = true;

      if( this.submitCounter >= 4 ){
        this.snackbar.open('Aitab küll...', 'Ok', {
          duration: 3000
        });
      }

      this.http.post(endPoint, {
        idCode: personalCode
      }, {
        responseType: "json"
      })
      .subscribe( data => {
        that.content = data;
        this.loading = false;
      }, error => {
        that.content = error;
        this.loading = false;
      });

    }

    

  }

}
