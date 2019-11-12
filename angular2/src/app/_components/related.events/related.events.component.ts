import { Component, OnDestroy, ViewChild, Input, OnInit } from '@angular/core';
import { RootScopeService } from '@app/_services/rootScopeService';
import { Subscription } from 'rxjs/Subscription';
import { HttpService } from '@app/_services/httpService';

@Component({
  selector: 'related-events',
  templateUrl: './related.events.component.html',
  styleUrls: ['./related.events.component.scss']
})

export class RelatedEventsComponent implements OnInit {

  @Input() groupID: number;
  @Input() nid: any;
  public content: object[];
  public lang: string;

  constructor(
    private rootScope: RootScopeService,
    private http: HttpService
  ) {}

  ngOnInit() {
    const variables = {
      groupID: this.groupID.toString(),
      nid: this.nid.toString(),
      lang: this.rootScope.get('lang').toUpperCase(),
    };
    const subscription = this.http.get('getRelatedEvents', { params: variables }).subscribe((response) => {
      const data = response['data'];
      if (data['nodeQuery']) {
        this.content = data['nodeQuery']['entities'].sort((a: object, b: object) => (a['fieldEventMainDate']['date'] < b['fieldEventMainDate']['date'] ? -1 : 1));
      }
      subscription.unsubscribe();
    });
  }
}

