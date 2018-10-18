import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NewsService, RootScopeService } from '@app/_services';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { componentFactoryName } from '@angular/compiler';
import { AppComponent } from '@app/app.component';
import { Subscription } from 'rxjs/Subscription';
import { Apollo } from 'apollo-angular';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {ImagePopupDialog} from '@app/_components/dialogs/image.popup/image.popup.dialog';
import {VideoComponent} from '@app/_components/video/video.component';
import { UserService } from '@app/_services/userService';


@Component({
  templateUrl: './news.single.component.html',
  styleUrls: ['./news.single.component.scss']
})

export class NewsSingleComponent implements OnInit {

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
		private newsService: NewsService,
		private rootScope:RootScopeService, 
    private apollo: Apollo,
    public dialog: MatDialog,
    private user: UserService
   ) {

    this.route.params.subscribe( params => {

      this.content = false;

      this.error = false;

      const path = this.router.url;

      const that = this;

      newsService.getSingle(path, function(data) {
        if ( data['route'] == null ) {
          that.error = true;
        } else {
          that.content = data['route']['entity'];
        }

        that.allNewsPath = path.split("/");
        that.allNewsPath = that.allNewsPath.slice(0, that.allNewsPath.length - 1).join("/");

        //language service
        const langOptions = data['route']['languageSwitchLinks'];
        let langValues = {};
        for( var i in langOptions ){
          langValues[langOptions[i].language.id] = langOptions[i].url.path;
        }
        that.rootScope.set('langOptions', langValues);
        //language service
      });

    });
  }

  ngOnInit() {
    this.route.params.subscribe( params => {
      this.userLoggedOut = this.user.getData()['isExpired'];
    });
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
