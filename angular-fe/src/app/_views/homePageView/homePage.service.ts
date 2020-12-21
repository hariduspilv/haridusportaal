import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import FieldVaryService from '@app/_services/FieldVaryService';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { SettingsService } from '@app/_services/SettingsService';
import {
  ICareerSlide,
  IContact,
  IEvent,
  IFooterData,
  IGraph,
  IGraphContacts,
  IGraphExternalLinks,
  IGraphLearningToTeach,
  IGraphNews,
  IGraphResponse,
  IGraphService,
  IGraphTopic,
  ILink,
  ILogo,
  IService,
  ISimpleArticle,
  ISlogan,
  IStudy,
  ITopic,
  ITopicArticleUnion,
  IURL,
} from './homePage.model';
import { map, mergeMap } from 'rxjs/operators';

@Injectable()
export class HomePageService {
  public eventCount: number = 2;
  public themeQuery = {
    default: 'newFrontPageQuery',
    teachers: 'teachingPage',
    career: 'careerPage',
    learning: 'learningHomePage',
    youth: 'youthHomePage',
  };

  public articleImages: {[key: string]: string[]} = {
    default: [
      'homepage-articles-1.svg',
      'homepage-articles-2.svg',
      'homepage-articles-3.svg',
    ],
    career: [
      'homepage-articles-career-1.svg',
    ],
    learning: [
      'homepage-articles-learning-1.svg',
      'homepage-articles-learning-2.svg',
    ],
    youth: [
      'homepage-articles-youth-1.svg',
      'homepage-articles-youth-2.svg',
    ],
  };

  public eventImages: string[] = [
    'homePage-events-1.svg',
    'homePage-events-2.svg',
  ];

  public topics: {[key: string]: ITopic[]} = {
    career: [
      {
        title: this.translate.get('home.topics_areas'),
        link: {
          title: this.translate.get('home.view_more'),
          url: {
            path: '/valdkonnad',
            routed: true,
          },
        },
      },
      {
        title: this.translate.get('home.topics_professions'),
        link: {
          title: this.translate.get('home.view_more'),
          url: {
            path: '/ametialad',
            routed: true,
          },
        },
      },
    ],
    learning: [
      {
        title: this.translate.get('home.topics_curricula'),
        link: {
          title: this.translate.get('home.view_more'),
          url: {
            path: '/erialad',
            routed: true,
          },
        },
      },
      {
        title: this.translate.get('home.topics_institutions'),
        link: {
          title: this.translate.get('home.view_more'),
          url: {
            path: '/kool',
            routed: true,
          },
        },
      },
    ],
  };

  public logos: {[key: string]: ILogo[]} = {
    teachers: [
      {
        src: '/assets/img/homepage-teachers.svg',
        label: 'Logo - Õpetajad loovad homse eesti',
      },
    ],
    career: [
      {
        src: '/assets/img/homepage-footer-career-1.svg',
        label: 'Logo - sihtasutus Kutsekoda',
      },
      {
        src: '/assets/img/homepage-footer-career-2.svg',
        label: 'Logo - OSKA',
      },
      {
        src: '/assets/img/homepage-footer-career-3.svg',
        label: 'Logo - Eesti töötukassa',
      },
    ],
    learning: [
      {
        src: '/assets/img/homepage-footer-learning-1.svg',
        label: 'Logo - Innove',
      },
    ],
    youth: [
      {
        src: '/assets/img/haridus-ja-noorteamet-logo.svg',
        label: 'Haridus- ja noorteamet',
      },
      {
        src: '/assets/img/teeviit-logo.svg',
        label: 'Teeviit',
      },
    ],
  };

  constructor(
    private settings: SettingsService,
    private translate: TranslateService,
    private http: HttpClient) {}

  public getResource(query: string): Observable<any> {
    const variables = {
      lang: 'ET',
    };
    const path = this.settings.query(query, variables);
    return this.http.get(path);
  }

  public getPageData(theme: string): Observable<any> {
    return this.getResource(this.themeQuery[theme]);
  }

  public getArticleImage(theme: string, index: number): string {
    const images = this.articleImages[theme] || this.articleImages.default;
    return `/assets/img/${images[index % images.length]}`;
  }

  public getEventImage(index: number): string {
    return `/assets/img/${this.eventImages[index % this.eventImages.length]}`;
  }

  public getCareerDevelopmentSlides(url: string): Observable<ICareerSlide[]> {
    const variables = {
      path: url,
    };
    const query = this.settings.query('getArticle', variables);
    return this.http.get(query).pipe(map((response: any) => {
      const accordionData = response.data.route.entity.fieldAccordionSection;
      return accordionData.map((item: any) => {
        const slug = item.entity.fieldAccordionTitle.toLowerCase()
          .replace(/span/g, '')
          .replace(/<a href=".+?>/g, '')
          .replace(/<\/a>/g, '')
          .replace(/ /g, '-')
          .replace(/[^A-Za-z0-9üõöä]+/igm, '-');
        return {
          slug,
          title: item.entity.fieldAccordionTitle,
          path: url,
        };
      });
    }));
  }

  public getSingleNews(url: string): Observable<ISimpleArticle> {
    const variables = {
      path: url,
    };
    const query = this.settings.query('newsSingel', variables);
    return this.http.get(query).pipe(map((response) => {
      return {
        title: '',
        ...FieldVaryService(response['data']['route']['entity']),
        path: url,
      };
    }));
  }

  public alternateMapping(data: any[], theme: string): any[] {
    return data.map((item, index) => {
      let position = index % 2 ? 'left' : 'right';
      if (theme === 'career') {
        position = index % 2 ? 'right' : 'left';
      }
      return {
        position,
        ...item,
      };
    });
  }

  public cleanTopic(items: IGraphTopic[]): ITopic[] {
    return items.map((item: IGraphTopic) => {
      return {
        title: item.entity.fieldTitle,
        content: item.entity.fieldText,
        theme: item.entity.fieldTheme,
        link: {
          title: this.translate.get('home.view_more'),
          url: {
            routed: item.entity.fieldInternalLink.entity.entityUrl.routed,
            path: item.entity.fieldInternalLink.entity.entityUrl.path,
          },
        },
      };
    });
  }

  public getTopicsAndArticles(data: IGraphResponse, theme: string): ITopicArticleUnion {
    const source = data.topics;
    if (!source) {
      return { articles: [], topics: [] };
    }

    let items = source;
    if (!Array.isArray(items)) {
      items = [items];
    }

    let articles: ITopic[] = [];
    let topics: ITopic[] = [];
    if (theme === 'youth') {
      topics = this.cleanTopic(items);
      articles = this.cleanTopic([data.fieldYouthContentPage]);
    } else if (['career', 'learning'].indexOf(theme) !== -1) {
      articles = this.cleanTopic(items);
      topics = this.topics[theme];
    } else {
      topics = items.map((item: IGraphTopic) => {
        let image: any = false;
        let link: any;
        let scrollTo: boolean | string = false;

        if (theme === 'default') {
          image = '';
          link = item.entity.fieldTopicLink;
          if (link.url.path.match('scrollTo:')) {
            scrollTo = link.url.path.split('scrollTo:')[1];
          }
        } else if (theme === 'teachers') {
          link = {
            title: this.translate.get('home.view_more'),
            url: item.entity.fieldInternalLink.entity.entityUrl,
          };
        }

        return {
          image,
          link,
          scrollTo,
          title: item.entity.fieldTopicTitle || item.entity.fieldThemeTitle,
          content: item.entity.fieldTopicText,
          button: item.entity.fieldTopicButtonText,
        };
      });
    }

    if (!articles.length && topics.length && theme === 'default') {
      articles = topics;
    }

    if (articles.length) {
      articles = this.alternateMapping(articles, theme)
        .filter((item) => {
          return item.title !== '-';
        })
        .map((topic: ITopic, index: number) => {
          if (this.articleImages[theme]) {
            topic.image = this.getArticleImage(theme, index);
          }
          return topic;
        });
    }

    if (topics.length) {
      topics = this.alternateMapping(topics, theme);
    }

    return { articles, topics };
  }

  public getCarousel(data: IGraphResponse, theme: string): IService[] {
    let services: IService[] = [];

    if (!data.services) {
      return services;
    }

    services = data.services.map((item: any) => {
      const entity = FieldVaryService(item.entity) as IGraphService;
      const image = entity.image.entity;
      const alt = image ? image.fieldAlt : undefined;

      let url: string;
      if (image.fieldServiceImg) {
        url = image.fieldServiceImg.entity.url;
      } else {
        url = image.url;
      }

      let link: ILink;
      if ('entity' in entity.link) {
        link = {
          title: entity.linkTitle,
          url: entity.link.entity.entityUrl,
        };
      } else {
        link = entity.link as ILink;
      }

      return {
        link,
        title: entity.title,
        image: {
          alt,
          url,
        },
        content: entity.content,
      };
    });

    return services;
  }

  public getLogos(theme: string): ILogo[] {
    return this.logos[theme] || [];
  }

  public getContacts(data: IGraphResponse, theme: string): IFooterData {
    if (theme === 'default') {
      return {
        email: data.email,
        name: data.name,
        phone: data.phone,
      };
    }

    const result: IFooterData = {};

    const contact = data.contact || data.fieldContact;
    if (contact) {
      result.contacts = contact.map((item: IGraphContacts) => {
        return {
          company: item.entity.fieldInstitution,
          name: item.entity.fieldNameOccupation,
          email: item.entity.fieldEmail,
          skype: item.entity.fieldSkype,
        };
      });
    }

    const links = data.externalLinks;
    if (links) {
      result.links = links.map((item: IGraphExternalLinks) => {
        return {
          title: item.entity.fieldLinkName,
          path: item.entity.fieldWebpageLink.url.path,
          routed: false,
        };
      });
    }

    result.logos = this.getLogos(theme);

    return result;
  }

  public getSlogan(data: IGraphResponse, theme: string): ISlogan | string {
    if (theme === 'default') {
      return data.quoteText;
    }

    const slogan: ISlogan = {
      title: data.quoteText,
      person: data.quoteAuthor,
      company: data.quoteAuthorWork,
    };

    if (theme === 'learning') {
      if (slogan.title) {
        slogan.title = `<q>${slogan.title}</q>`;
      }
    }

    return slogan;
  }

  public getStudy(data: IGraphResponse, theme: string): IStudy {
    let study: IStudy;
    if (theme === 'default') {
      study = {
        title: this.translate.get('home.study_title'),
        intro: this.translate.get('home.study_intro'),
        data: [{
          title: this.translate.get('home.profession_compare'),
          image: '/assets/img/homepage-study-1.svg',
          url: {
            path: '/ametialad',
            routed: true,
          },
        },
        {
          title: this.translate.get('home.studyprogramme_compare'),
          image: '/assets/img/homepage-study-2.svg',
          url: {
            path: '/erialad',
            routed: true,
          },
        }],
      };
    } else if (theme === 'learning') {
      study = {
        title: this.translate.get('home.study_teaching'),
        intro: this.translate.get('home.study_teaching_intro'),
        data: data.fieldLearningToTeach.map((obj: IGraphLearningToTeach, i: number) => {
          return {
            title: obj.entity.fieldLearningToTeachTitle,
            image: `/assets/img/homepage-learning-${i + 1}.svg`,
            url: obj.entity.fieldLearningToTeachSitelink.entity.entityUrl,
          };
        }),
      };
    }
    return study;
  }

  public getNews(data: IGraphResponse, theme: string): Observable<ISimpleArticle> | null {
    const source = data.news;

    if (!source) {
      return null;
    }

    return this.getSingleNews(source.entity.entityUrl.path);
  }

  public parseEvents(items: IGraphNews[]): IEvent[] {
    return items.map((item: IGraphNews, index: number) => {
      return {
        title: item.entityLabel,
        author: item.fieldOrganizer,
        created: item.fieldEventMainDate.unix,
        content: item.fieldDescriptionSummary,
        location: (typeof item.fieldEventLocation !== 'string')
          ? item.fieldEventLocation.name : item.fieldEventLocation,
        link: {
          title: this.translate.get('button.read_more'),
          url: {
            path: item.entityUrl.path,
          },
        },
        image: this.getEventImage(index),
      };
    });
  }

  public getEvents(): Observable<IEvent[]> {
    const variables = {
      lang: 'ET',
    };

    const one = this.settings.query('teachingPageEvents', variables);
    const two = this.settings.query('teachingPageAdditionalEvents', variables);
    return this.http.get(one).pipe(mergeMap((response: IGraph) => {
      if (response.data.nodeQuery.entities.length < this.eventCount) {
        return this.http.get(two).pipe(map((additional: IGraph) => {
          return this.parseEvents([
            ...response.data.nodeQuery.entities,
            ...additional.data.nodeQuery.entities,
          ].slice(0, this.eventCount));
        }));
      }
      return of(this.parseEvents(response.data.nodeQuery.entities));
    }));
  }
}
