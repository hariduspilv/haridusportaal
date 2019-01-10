import { Component, OnDestroy, ViewChild, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RootScopeService } from '@app/_services';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { componentFactoryName } from '@angular/compiler';
import { AppComponent } from '@app/app.component';
import { Subscription } from 'rxjs/Subscription';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {ImagePopupDialog} from '@app/_components/dialogs/image.popup/image.popup.dialog';
import {VideoComponent} from '@app/_components/video/video.component';
import { UserService } from '@app/_services/userService';

import { HttpService } from '@app/_services/httpService';

@Component({
  selector: "news-component",
  templateUrl: './news.single.component.html',
  styleUrls: ['./news.single.component.scss']
})

export class NewsSingleComponent implements OnInit {

  @Input() inputData;

  private querySubscription: Subscription;  
  private path: string;
  private lang: string;
  private userLoggedOut: boolean = false;
  
  content: any;
  unix: any;
  error: boolean;
  map: any;
  allNewsPath: any;

  constructor(
		private router: Router,
		private route: ActivatedRoute,
		private rootScope:RootScopeService, 
    public dialog: MatDialog,
    private user: UserService,
    private http: HttpService
   ) {

  }

  handleData(data){
    var that = this;
    const path = this.router.url;
    that.content = data['route']['entity'];
    that.allNewsPath = path.split("/");
    that.allNewsPath = that.allNewsPath.slice(0, that.allNewsPath.length - 1).join("/");

  }
  ngOnInit() {
    if( this.inputData ){
      this.handleData({
        route: {entity: this.inputData}
      });
    }else{
      this.route.params.subscribe( params => {

        this.content = false;
  
        this.error = false;
  
        const path = this.router.url;
  
        const that = this;
  
        let url = "/graphql?queryName=newsSingle&queryId=948aa7e7f80ba87b6634d1e6834dd560ac2591ba:1&variables=";
        let variables = {
          path: path
        };
        
        let subscribe = this.http.get(url+JSON.stringify(variables)).subscribe( (response) => {
          let data = response['data'];
          if ( data['route'] == null ) {
            that.error = true;
          } else {
            this.handleData(data);
          }
  
          subscribe.unsubscribe();
        });
  
      });
      this.route.params.subscribe( params => {
        this.userLoggedOut = this.user.getData()['isExpired'];
      });
    }
    
  }

  openDialog(): void {
    let dialogRef = this.dialog.open(ImagePopupDialog, {
      data: {
        src: this.content.fieldIntroductionImage.derivative.url,
        title: this.content.fieldIntroductionImage.title,
        alt: this.content.fieldIntroductionImage.alt
      }
    });
  }
}
