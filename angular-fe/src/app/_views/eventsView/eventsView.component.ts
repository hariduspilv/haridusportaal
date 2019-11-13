//tslint:disable
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SettingsService } from '@app/_services';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'events-view',
  templateUrl: 'eventsView.template.html',
  styleUrls: ['eventsView.styles.scss'],
})

export class EventsViewComponent implements OnDestroy, OnInit{
  public breadcrumbsPath: string = '/sündmused';
  public eventsTypes;
  public eventsTags;
  public eventsTypesSet;
  public eventsTagsObs;
  showFilter: boolean = false;
  filterFull: boolean = false;
  private subscriptions: Subscription[] = [];
  constructor(
    private settings:SettingsService,
    private http: HttpClient,
    private route: ActivatedRoute,
  ) {}

  getTypes() {

    let variables = {
      lang: 'ET',
    };

    const path = this.settings.query('getEventTypes', variables);
    let typesSubscription = this.http.get(path).subscribe((response) => {
      
      let data = response['data'];

      this.eventsTypes = data['taxonomyTermQuery']['entities'];

      let newsTidArr = [];
      for( var i in this.eventsTypes ){
        let current = this.eventsTypes[i];

        if( !current ){ continue; }

        let tmp = {
          id: current['tid'].toString(),
          name: current['name'],
        };
        newsTidArr.push(tmp);           
      };

      newsTidArr = newsTidArr.filter((thing, index, self) =>
      index === self.findIndex((t) => (
        t.id === thing.id && t.name === thing.name
      )))
      this.eventsTypesSet = [...newsTidArr];
      this.eventsTypes = this.eventsTypes.map((item) => {
        return {
          key: item.name,
          value: item.tid,
        }
      });
    });

    this.subscriptions = [...this.subscriptions, typesSubscription];

  }

  getTags() {
    let variables = {
      lang: 'ET',
    };
    const path = this.settings.query('getEventTags', variables);
    let tagSubscription = this.http.get(path).subscribe((response: any) => {
      const data = response.data.taxonomyTermQuery.tags;
      this.eventsTags = data.filter((e) => e.referencedNodes.count > 0).map((item) => {
        return {
          key: item.entityLabel,
          value: item.entityId
        }
      });
      this.eventsTagsObs = of(this.eventsTags).pipe(delay(500));
    });
    this.subscriptions = [...this.subscriptions, tagSubscription];
  }
  
  ngOnInit() {
    this.getTags();
    this.getTypes();
  }

  ngOnDestroy() {
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
}
