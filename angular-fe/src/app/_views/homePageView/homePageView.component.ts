import {
  Component,
  OnInit,
} from '@angular/core';
import { HomePageService } from '@app/_services';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'homepage',
  templateUrl: 'homePageView.template.html',
  styleUrls: ['homePageView.styles.scss'],
})
export class HomePageViewComponent implements OnInit {
  public topics: any[] = [];
  public articles: any[];
  public services: any[] = [];
  public contact: any = {};
  public slogan: any = '';
  public news: any = {
    title: '',
    path: '',
  };
  public theme: string = 'default';
  public events: any[] = [];
  public study: any = {};
  public careerDevelopment: string;

  constructor(
    private route: ActivatedRoute,
    private service: HomePageService,
  ) {
  }

  ngOnInit() {
    this.route.data.subscribe((response) => {
      this.theme = response.theme || this.theme;
      this.service.getPageData(this.theme).subscribe((response) => {
        this.parseData(response['data']['nodeQuery']['entities'][0]);
      });
    });
  }

  private parseData(data: any): void {
    if (this.theme === 'career') {
      this.careerDevelopment = data.fieldCareer.entity.entityUrl.path;
    }

    const { topics, articles } = this.service.getTopicsAndArticles(data, this.theme);
    this.services = this.service.getCarousel(data, this.theme);
    this.contact = this.service.getContacts(data, this.theme);
    this.slogan = this.service.getSlogan(data, this.theme);
    this.study = this.service.getStudy(data, this.theme);
    this.topics = topics;
    this.articles = articles;

    const newsSub = this.service.getNews(data, this.theme);
    if (newsSub) {
      newsSub.subscribe((news: any) => this.news = news);
    }
  }
}
