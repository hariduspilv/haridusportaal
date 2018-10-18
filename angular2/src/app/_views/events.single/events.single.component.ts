import { Component, OnDestroy, ViewChild, OnInit, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RootScopeService, MetaTagsService } from '@app/_services';

import { componentFactoryName } from '@angular/compiler';
import { AppComponent } from '@app/app.component';
import { Subscription } from 'rxjs/Subscription';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { ImagePopupDialog } from '@app/_components/dialogs/image.popup/image.popup.dialog'
import { Angular2Csv } from 'angular2-csv/Angular2-csv';
import { TranslateService } from '@ngx-translate/core';
import { TableService } from '@app/_services/tableService';

import { SettingsService } from '@app/_core/settings';
import { HttpService } from '@app/_services/httpService';
import * as _moment from 'moment';
import { UserService } from '@app/_services/userService';

const moment = _moment;

@Component({
  templateUrl: './events.single.component.html',
  styleUrls: ['./events.single.component.scss']
})

export class EventsSingleComponent implements AfterViewChecked {
  
  private querySubscription: Subscription;  
  private path: string;
  private lang: string;
  
  participants: Array<any>;
  participantsSortOrder: object = {};

  participantsUrl: string;
  participantsListActiveState: boolean = false;
  phoneVisible: boolean = false;
  createdVisible: boolean = false;
  commentVisible: boolean = false;
  routerSubscription: any;
  viewTranslations: any;
  tableOverflown: boolean = false;
  elemAtStart: boolean = true;
  initialized: boolean = false;
  userLoggedOut: boolean = false;

  content: any;
  unix: any;
  error: boolean;
  map: any;


  sortedParticipants: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private rootScope:RootScopeService,
    public dialog: MatDialog,
    private metaTags: MetaTagsService,
    private translate: TranslateService,
    private settings: SettingsService,
    private tableService: TableService,
    private http: HttpService,
    private user: UserService
  ) {
    this.participantsUrl = this.settings.url+"/htm_custom_event_registration/registrations/";
  }

  ngOnInit() {
    this.routerSubscription = this.router.events.subscribe((event) => {
      this.participantsListActiveState = this.participants && location.hash === "#osalejad"
    });
    let values = ['download','column.close','column.open','sort']
    this.translate.get(values).subscribe(translations => {
      this.viewTranslations = translations
    })


    this.route.params.subscribe( params => {
      this.content = false;
      this.error = false;
      const path = this.router.url;
      const that = this;
      
      let url = "/graphql?queryId=getEventSingle:1&variables=";
      let variables = {
        path: path
      };

      this.userLoggedOut = this.user.getData()['isExpired'];

      let subscribe = this.http.get(url+JSON.stringify(variables)).subscribe( (response) => {
        let data = response['data'];
        if ( data['route'] == null ) {
          that.error = true;
        } else {

          that.content = data['route'];

          that.participants = JSON.parse(JSON.stringify(that.content.entity.EventRegistrations));

          if( that.participants ){
            that.organizeParticipants();
          }

          if( that.content.entity.fieldEventLocation ){
            that.map = {
              "lat": parseFloat(that.content.entity.fieldEventLocation.lat),
              "lon": parseFloat(that.content.entity.fieldEventLocation.lon),
              "zoom": parseFloat(that.content.entity.fieldEventLocation.zoom)
            }
          }
          that.unix = new Date().getTime();
          that.participantsListActiveState = that.participants && location.hash === "#osalejad";

          const langOptions = data['route']['languageSwitchLinks'];

          let langValues = {};
          for( var i in langOptions ){
            langValues[langOptions[i].language.id] = langOptions[i].url.path;
          }
          that.rootScope.set('langOptions', langValues);
          
        }


        subscribe.unsubscribe();
      });

        
    });
  }
  ngAfterViewChecked() {
    this.initialTableCheck('participantsElem')
  }
  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }

  sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  }
  organizeParticipants(key:string = "created"){

    let tmpParticipants = JSON.parse(JSON.stringify(this.participants));

    tmpParticipants = this.sortByKey(tmpParticipants['entities'], key);

    for( let i in tmpParticipants ){
      tmpParticipants[i]['participantIndex'] = parseInt(i)+1;
    }


    if( !this.participantsSortOrder[key] ){
      this.participantsSortOrder[key] = 'desc';
    }

    for( var i in this.participantsSortOrder ){
      if( key == i ){
        this.participantsSortOrder[i] = this.participantsSortOrder[i] == 'asc' ? 'desc' : 'asc';
      }else{
        this.participantsSortOrder[i] = '';
      }
    }

    if( this.participantsSortOrder[key] == 'desc'){
      tmpParticipants.reverse();
    }

    this.sortedParticipants = tmpParticipants;

  }
  
  getCSV() {
    
    let exportData = JSON.parse( JSON.stringify( this.sortedParticipants ) );

    
    let exportLabels = [];

    for( var i in exportData ){
      delete exportData[i]['__typename'];
      delete exportData[i]['created'];

      exportData[i]['participantIndex'] = i+1;

      for( var ii in exportData[i] ){

        let translatedLabel = this.translate.get(ii)['value'];

        if( !exportLabels.includes(translatedLabel) ){
          exportLabels.push(translatedLabel);
        }

        if( exportData[i][ii] == null ){
          exportData[i][ii] = '';
        }
        else if( ii == "participantCreated" ){
          exportData[i][ii] = moment(exportData[i][ii] * 1000).format("DD.MM.YYYY HH:mm");
        }
      }
    }

    new Angular2Csv(exportData, this.content.entity.entityLabel, {
      fieldSeparator: ";",
      showLabels: true,
      headers: exportLabels
    });

     
  }
  
  onViewChange(change) {
    this.participantsListActiveState = change;
  }
  
  revertParticipantsListState() {
    location.hash = ''
  }

  openImage(): void {
    let dialogRef = this.dialog.open(ImagePopupDialog, {
      data: {
        src: this.content.entity.fieldPicture.derivative.url,
        title: this.content.entity.fieldPicture.title,
        alt: this.content.entity.fieldPicture.url
      }
    });
  }
  initialTableCheck(id) {
    const element = document.getElementById(id);
    if (element) {
      this.tableOverflown = (element.scrollWidth - element.scrollLeft) > element.clientWidth;
      this.initialized = true;
    }
  }

}
