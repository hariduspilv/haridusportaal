import { Component, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { Subscription } from '../../../../node_modules/rxjs';
import { HttpService } from '@app/_services/httpService';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './xjson.template.html',
  styleUrls: ['./xjson.styles.scss']
})
export class XjsonComponent implements OnInit, OnDestroy{
  public lang: string;
  public form_name: string;
  public subscriptions: Subscription[] = [];
  public data;

  constructor(
    private http: HttpService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  pathWatcher() { 
    let subscribe = this.route.params.subscribe(
      (params: ActivatedRoute) => {

        this.form_name = params['form_name']
        this.lang = params['lang'];
      }
    );

    this.subscriptions = [...this.subscriptions, subscribe];
  }
  getData(data){
    console.log('getting data');
    let subscribe = this.http.post('/xjson_service?_format=json', data).subscribe(response => {
      console.log(response);
      this.data = response;
      
      subscribe.unsubscribe();
    });

  }
  ngOnInit(){
    this.pathWatcher();
    console.log(this.form_name);
    this.getData({form_name: this.form_name});

  };

  ngOnDestroy(){
    /* Clear all subscriptions */
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  };

};