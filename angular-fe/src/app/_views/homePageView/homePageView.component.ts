import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '@app/_services';
import FieldVaryService from '@app/_services/FieldVaryService';

@Component({
  selector: 'homepage-line',
  templateUrl: 'homePageView.line.html',
})
export class HomePageLineComponent {
  @Input() type: string = '1';
}

@Component({
  selector: 'homepage-navblock',
  templateUrl: 'blocks/homePageView.navblock.html',
})
export class HomePageNavBlockComponent {
  @Input() data;
}

@Component({
  selector: 'homepage-articles',
  templateUrl: 'blocks/homePageView.articles.html',
})
export class HomePageArticlesComponent {
  @Input() data: [] = [];
}

@Component({
  selector: 'homepage-slides',
  templateUrl: 'blocks/homePageView.slides.html',
})
export class HomePageSlidesComponent {
  @Input() data: [] = [];
}

@Component({
  selector: 'homepage-topical',
  templateUrl: 'blocks/homePageView.topical.html',
})
export class HomePageTopicalComponent implements OnInit, OnChanges{
  constructor(
    private http: HttpClient,
    private settings: SettingsService,
  ) {}

  @Input() data: string;
  private article: {} = {};

  private getData() {
    if (!this.data) { return false; }
    const variables = {
      path: this.data,
    };
    const query = this.settings.query('newsSingel', variables);
    const subscription = this.http.get(query).subscribe((response) => {
      this.article = {
        ... FieldVaryService(response['data']['route']['entity']),
        path: this.data,
      };
      subscription.unsubscribe();
    });
  }

  ngOnInit() {
    this.getData();
  }
  ngOnChanges() {
    this.getData();
  }
}

@Component({
  selector: 'homepage-study',
  templateUrl: 'blocks/homePageView.study.html',
})
export class HomePageStudyComponent {}

@Component({
  selector: 'homepage-slogan',
  templateUrl: 'blocks/homePageView.slogan.html',
})
export class HomePageSloganComponent {
  @Input() data: string = '';
}

@Component({
  selector: 'homepage-footer',
  templateUrl: 'blocks/homePageView.footer.html',
})
export class HomePageFooterComponent {
  @Input() data: {};
}

@Component({
  selector: 'homepage',
  templateUrl: 'homePageView.template.html',
  styleUrls: ['homePageView.styles.scss'],
})

export class HomePageViewComponent implements OnInit {
  public topics: [] = [];
  public services: any[] = [];
  public contact: {};
  public slogan: string = '';
  public newsLink: string = '';

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
  ) {}

  private getData(): void {
    const variables = {
      lang: 'ET',
    };

    const path = this.settings.query('newFrontPageQuery', variables);
    const topicsSubscription = this.http.get(path).subscribe((response) => {
      this.parseData(response['data']['nodeQuery']['entities'][0]);
      topicsSubscription.unsubscribe();
    });
  }

  private parseData(data): void {
    try {
      this.topics = data.fieldFrontpageTopics.map((item) => {
        return {
          title: item.entity.fieldTopicTitle,
          content: item.entity.fieldTopicText,
          link: item.entity.fieldTopicLink,
          image: item.entity.fieldTopicImage.entity.url,
          button: item.entity.fieldTopicButtonText,
        };
      });
    } catch (err) {}

    try {
      this.contact = {
        email: data.fieldFrontpageContactEmail,
        name: data.fieldFrontpageContactName,
        phone: data.fieldFrontpageContactPhone,
      };
    } catch (err) {}

    this.slogan = data.fieldFrontpageQuote;

    try {
      this.services = data.fieldFrontpageServices.map((item) => {
        const image = item.entity.fieldServiceImage.entity;
        const alt = image ? image.fieldAlt : undefined;
        const url = image && image.fieldServiceImg.entity ?
          image.fieldServiceImg.entity.url : undefined;

        return {
          title: item.entity.fieldServiceTitle,
          link: item.entity.fieldServiceLink,
          image: {
            alt,
            url,
          },
          content: item.entity.fieldServiceContent,
        };
      });
    } catch (err) {}

    try {
      this.newsLink = data.fieldFrontpageNews.entity.entityUrl.path;
    } catch (err) {}

    console.log({
      topics: this.topics,
      services: this.services,
      contact: this.contact,
      slogan: this.slogan,
      newsLink: this.newsLink,
    });
  }

  ngOnInit() {
    this.getData();
  }
}