import { Component, OnDestroy, OnInit } from '@angular/core';
import { HomePageService } from './homePageView.service';
import { ActivatedRoute } from '@angular/router';
import {
  IEvent,
  IFooterData,
  IGraph,
  IGraphResponse,
  IService,
  ISimpleArticle,
  ISlogan,
  IStudy,
  ITopic,
} from './homePageView.model';
import FieldVaryService from '@app/_services/FieldVaryService';
import { TitleService } from '@app/_services/TitleService';
import { TranslateService } from '@app/_modules/translate/translate.service';

@Component({
  selector: 'homepage',
  templateUrl: 'homePageView.template.html',
  styleUrls: ['homePageView.styles.scss'],
})
export class HomePageViewComponent implements OnInit, OnDestroy {
  public title = '';
  public loading = true;
  public topics: ITopic[] = [];
  public articles: ITopic[];
  public services: IService[] = [];
  public contact: IFooterData = {};
  public theme: string = 'default';
  public careerDevelopment: string;
  public events: IEvent[] = [];
  public slogan: ISlogan = {
    title: '',
    person: '',
    company: '',
  };
  public study: IStudy = {
    title: '',
    intro: '',
    data: [],
  };
  public news: ISimpleArticle = {
    title: '',
    path: '',
  };

  constructor(
    private route: ActivatedRoute,
    private service: HomePageService,
    private translate: TranslateService,
    private titleService: TitleService,
  ) {}

  ngOnInit() {
    this.route.data.subscribe((response: { theme?: string; }) => {
      this.theme = response.theme || this.theme;
      this.service.getPageData(this.theme).subscribe((response: IGraph) => {
        this.parseData(FieldVaryService(response.data.nodeQuery.entities[0]));
      });
    });
    if (this.title) {
      this.titleService.setTitle(this.translate.get(this.title));
    }
  }

  ngOnDestroy() {
    this.titleService.setTitle('');
  }

  private parseData(data: IGraphResponse): void {
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
      newsSub.subscribe((news: ISimpleArticle) => {
        this.news = news;
        this.loading = false;
      });
    } else {
      this.loading = false;
    }
  }
}
