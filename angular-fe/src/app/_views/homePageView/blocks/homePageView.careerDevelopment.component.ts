import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { SettingsService } from '@app/_services';

@Component({
  selector: 'homepage-careerDevelopment',
  templateUrl: 'homePageView.careerDevelopment.html',
})
export class HomePageCareerDevelopmentComponent implements OnInit {
  @Input() title: string;
  @Input() description: string;
  @Input() url: string;
  @Input() theme: string;
  @Input() line: number = 3;
  public data: any[] = [];

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
  ) {
  }

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }

  ngOnInit() {
    if (this.url) {
      this.getData();
    }
  }

  private getData(): void {
    const variables = {
      path: this.url,
    };
    const query = this.settings.query('getArticle', variables);
    const subscription = this.http.get(query).subscribe((response: any) => {
      try {
        const accordionData = response.data.route.entity.fieldAccordionSection;
        this.data = accordionData.map((item) => {
          const slug = item.entity.fieldAccordionTitle.toLowerCase()
            .replace(/span/g, '')
            .replace(/<a href=".+?>/g, '')
            .replace(/<\/a>/g, '')
            .replace(/ /g, '-')
            .replace(/[^A-Za-z0-9üõöä]+/igm, '-');
          return {
            slug,
            title: item.entity.fieldAccordionTitle,
            path: this.url,
          };
        });
      } catch (err) {
      }
      subscription.unsubscribe();
    });
  }
}
