import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { SettingsService } from '@app/_services';

@Component({
  selector: 'homepage-events',
  templateUrl: 'homePageView.events.html',
})
export class HomePageEventsComponent implements OnInit {
  @Input() data: any[] = [];
  @Input() theme: string;
  @Input() title: string;
  @Input() description: string;
  @Input() line: number = 1;

  private eventsAmount = 2;

  private imageList: string[] = [
    'homePage-events-1.svg',
    'homePage-events-2.svg',
  ];

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
    private translate: TranslateService,
  ) {
  }

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }

  ngOnInit() {
    this.getData();
  }

  private assignImages() {
    let counter = 0;
    this.data = this.data.map((item, index) => {
      if (counter >= this.imageList.length) {
        counter = 0;
      }
      const image = `/assets/img/${this.imageList[counter]}`;
      counter = counter + 1;
      return {
        ...item,
        image: {
          url: image,
        },
      };
    });
  }

  private getAdditional(entities): void {
    const variables = {
      lang: 'ET',
    };
    const query = this.settings.query('teachingPageAdditionalEvents', variables);
    const subscription = this.http.get(query).subscribe((response: any) => {
      try {
        this.data = [
          ...this.parseEvents(entities),
          ...this.parseEvents(response.data.nodeQuery.entities),
        ].slice(0, this.eventsAmount);
        this.assignImages();
      } catch (err) {
      }
    });
  }

  private parseEvents(items) {
    return items.map((item) => {
      return {
        title: item.entityLabel,
        author: item.fieldOrganizer,
        created: item.fieldEventMainDate.unix,
        content: item.fieldDescriptionSummary,
        location: item.fieldEventLocation ? item.fieldEventLocation.name : false,
        link: {
          title: this.translate.get('button.read_more'),
          url: {
            path: item.entityUrl.path,
          },
        },
        image: {
          url: 'http://htm.wiseman.ee/sites/default/files/2020-02/homepage-slides-1.svg',
        },
      };
    });
  }

  private getData(): void {

    const variables = {
      lang: 'ET',
    };
    const query = this.settings.query('teachingPageEvents', variables);

    const subscription = this.http.get(query).subscribe((response: any) => {
      try {
        if (response.data.nodeQuery.entities.length < this.eventsAmount) {
          this.getAdditional(response.data.nodeQuery.entities);
        } else {
          this.data = this.parseEvents(response.data.nodeQuery.entities);
          this.assignImages();
        }
      } catch (err) {
      }
      subscription.unsubscribe();
    });
  }
}
