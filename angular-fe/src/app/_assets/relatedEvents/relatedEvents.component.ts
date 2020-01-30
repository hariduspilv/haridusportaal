import {
  Component,
  Input,
  OnInit,
  OnDestroy,
 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { SettingsService } from '@app/_services';
import FieldVaryService from '@app/_services/FieldVaryService';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'relatedEvents',
  templateUrl: 'relatedEvents.template.html',
  styleUrls: ['relatedEvents.styles.scss'],
})

export class RelatedEventsComponent implements OnInit, OnDestroy {
  @Input() nid: number;
  @Input() groupID: number;
  public data = [];
  public loading: boolean = true;
  private subscription: Subscription = new Subscription;
  private routerSub: Subscription;

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
    private router: Router,
  ) {}

  private parseResponse(response):void {
    try {
      this.data = response['data']['nodeQuery']['entities'].map((item) => {
        return FieldVaryService(item);
      });
    } catch (err) {
      this.data = [];
    }
  }
  private getData():void {
    this.loading = true;
    const variables = {
      nid: this.nid,
      groupID: this.groupID,
      lang: 'ET',
    };

    const path = this.settings.query('getRelatedEvents', variables);
    this.subscription = this.http.get(path).subscribe((response) => {
      this.parseResponse(response);
      this.loading = false;
    });
  }

  ngOnInit() {
    this.getData();
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.routerSub.unsubscribe();
  }
}
