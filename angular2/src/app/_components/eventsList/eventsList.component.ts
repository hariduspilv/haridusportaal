import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpService } from '@app/_services/httpService';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { RootScopeService } from '@app/_services/rootScopeService';
import * as _moment from 'moment';
const moment = _moment;
import { Subscription } from '../../../../node_modules/rxjs';

@Component({
  selector: 'eventsList',
  templateUrl: './eventsList.template.html',
  styleUrls: ['./eventsList.styles.scss']
})

export class EventsListComponent implements OnInit, OnDestroy{
 
  public events: {}[] = [];

  public lang: string;

  public date: any = new Date();
  public currentYear: number = this.date.getFullYear();
  public loading: boolean = false;
  public subscriptions: Subscription[] = [];

  constructor(
    private rootScope: RootScopeService,
    public http: HttpService, 
    public snackbar: MatSnackBar, 
    public route: ActivatedRoute) {}

  pathWatcher() { 
    let subscribe = this.route.params.subscribe(
      (params: ActivatedRoute) => {
        this.lang = params['lang'];
    });

    this.subscriptions = [...this.subscriptions, subscribe];
  }

  viewAllEventsLink(): string{
    switch(this.lang){
      case 'et':  return '/et/sundmused';
      case 'en':  return '/en/events';
      default: return '/et/sundmused';
    }
  }

  compareDate(unixDate) {
    return new Date(unixDate * 1000).getFullYear() > this.currentYear;
  }

  getData(){
    this.loading = true;

    let variables = {
      "tagsEnabled":false,
      "typesEnabled":false,
      "titleEnabled":false,
      "dateFrom": moment().format("YYYY-MM-DD"),
      "dateTo": moment().add(20, 'years').format("YYYY-MM-DD"),
      "offset":0,
      "limit":3,
      "lang": this.lang.toUpperCase(),
      "timeFrom":"0",
      "timeTo":"99999999"};

    let url = "/graphql?queryName=eventList&queryId=4abaff3a1d7f8e824f5e912c684fccf91ce099a6:1&variables=";
    
    let subscription = this.http.get( url + JSON.stringify(variables) ).subscribe( response => {
      
      this.loading = false;
      
      let data = response['data'];
      
      this.events = data['nodeQuery']['entities'].sort((a, b) => {
        if (moment(a.fieldEventMainDate.unix * 1000).format("YYYY-MM-DD") === moment(b.fieldEventMainDate.unix * 1000).format("YYYY-MM-DD")) {
          return a.fieldEventMainStartTime - b.fieldEventMainStartTime;
        }
        return 0;
      });
     
      subscription.unsubscribe();
    }, err => {
      this.loading = false;
    });
  }

  ngOnInit(){
    this.pathWatcher();
    this.getData();
  }
  ngOnDestroy(){
    /* Clear all subscriptions */
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
}
