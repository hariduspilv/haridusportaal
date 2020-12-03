import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import FieldVaryService from '@app/_services/FieldVaryService';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { SettingsService } from '@app/_services/SettingsService';
import {
  ICareerSlide,
  IContact,
  IEvent,
  IFooterData,
  ILogo,
  IService,
  ISimpleArticle,
  ISlogan,
  IStudy,
  ITopic,
  ITopicArticleUnion,
} from './homePage.model';

@Injectable()
export class HomePageService {
  public eventCount: number = 2;
  public themeQuery = {
    default: 'newFrontPageQuery',
    teachers: 'teachingPage',
    career: 'careerPage',
    learning: 'learningHomePage',
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
    const sub: Subject<ICareerSlide[]> = new Subject<ICareerSlide[]>();
    const variables = {
      path: url,
    };
    const query = this.settings.query('getArticle', variables);
    this.http.get(query).subscribe((response: any) => {
      const accordionData = response.data.route.entity.fieldAccordionSection;
      const data = accordionData.map((item: any) => {
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
      sub.next(data);
    });
    return sub;
  }

  public getSingleNews(url: string): Observable<ISimpleArticle> {
    const sub: Subject<ISimpleArticle> = new Subject<ISimpleArticle>();
    const variables = {
      path: url,
    };
    const query = this.settings.query('newsSingel', variables);
    this.http.get(query).subscribe((response) => {
      const article = {
        title: '',
        ...FieldVaryService(response['data']['route']['entity']),
        path: url,
      };
      sub.next(article);
    });
    return sub;
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

  public getTopicsAndArticles(data: any, theme: string): ITopicArticleUnion {
    const source = data.fieldFrontpageTopics ||
      data.fieldTeachingThemes ||
      data.fieldContentPageLink ||
      data.fieldLearningContentLinks;

    if (!source) {
      return { articles: [], topics: [] };
    }

    let items = source;
    if (!Array.isArray(items)) {
      items = [items];
    }

    let articles: ITopic[] = [];
    let topics: ITopic[] = [];

    if (['career', 'learning'].indexOf(theme) !== -1) {
      articles = items.map((item: any) => {
        return {
          title: item.entity.fieldTitle,
          content: item.entity.fieldText,
          link: {
            title: this.translate.get('home.view_more'),
            url: {
              routed: item.entity.fieldInternalLink.entity.entityUrl.routed,
              path: item.entity.fieldInternalLink.entity.entityUrl.path,
            },
          },
        };
      });
      topics = this.topics[theme];
    } else {
      topics = items.map((item: any) => {
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
          content: item.entity.fieldTopicText || false,
          button: item.entity.fieldTopicButtonText || false,
        };
      });
    }

    if (!articles.length && topics.length) {
      articles = topics;
    }

    if (articles.length) {
      articles = this.alternateMapping(articles, theme).filter((item) => {
        return item.title !== '-';
      });
    }

    if (topics.length) {
      topics = this.alternateMapping(topics, theme);
    }

    return { articles, topics };
  }

  public getCarousel(data: any, theme: string): IService[] {
    let services: IService[] = [];
    if (theme === 'default') {
      services = data.fieldFrontpageServices.map((item: any) => {
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
    } else if (theme === 'learning') {
      services = data.fieldLearningPath.map((item: any) => {
        const image = item.entity.fieldLearningCarouselImage.entity.url;
        return {
          title: item.entity.fieldLearningCarouselTitle,
          link: {
            title: item.entity.fieldLearnCarouselLinkTitle,
            url: item.entity.fieldLearningCarouselLink.entity.entityUrl,
          },
          image: {
            url: image,
          },
          content: item.entity.fieldLearningCarouselContent,
        };
      });
    } else if (theme === 'teachers') {
      services = data.fieldToolbox.map((item: any) => {
        const image = item.entity.fieldToolboxImage.entity.url;
        return {
          title: item.entity.fieldTitle,
          link: {
            title: item.entity.fieldLinkName,
            url: item.entity.fieldInternalLink.entity.entityUrl,
          },
          image: {
            url: image,
          },
          content: item.entity.fieldContent,
        };
      });
    }
    return services;
  }

  public getLogos(theme: string): ILogo[] {
    return this.logos[theme] || [];
  }

  public getContacts(data: any, theme: string): IFooterData {
    if (theme === 'default') {
      return {
        email: data.fieldFrontpageContactEmail,
        name: data.fieldFrontpageContactName,
        phone: data.fieldFrontpageContactPhone,
      };
    }

    const result: IFooterData = {};

    const contact = data.fieldContact || data.fieldCareerContact || data.fieldLearningContact;
    if (contact) {
      result.contacts = contact.map((item: any) => {
        return {
          company: item.entity.fieldInstitution || false,
          name: item.entity.fieldNameOccupation || false,
          email: item.entity.fieldEmail || false,
          skype: item.entity.fieldSkype || false,
        };
      });
    }

    const links = data.fieldExternal || data.fieldExternalLinks || data.fieldLearningExternalLinks;
    if (links) {
      result.links = links.map((item: any) => {
        return {
          url: {
            title: item.entity.fieldLinkName,
            path: item.entity.fieldWebpageLink.url.path,
            routed: false,
          },
        };
      });
    }

    result.logos = this.getLogos(theme);

    return result;
  }

  public getSlogan(data: any, theme: string): ISlogan {
    let slogan: ISlogan;
    if (theme === 'teachers' || theme === 'career') {
      slogan = {
        title: data.fieldQuoteText || false,
        person: data.fieldQuoteAuthor || false,
        company: data.fieldQuoteAuthorOccupation || false,
      };
    } else if (theme === 'learning') {
      slogan = {
        title: data.fieldLearningQuoteText || false,
        person: data.fieldLearningQuoteAuthor || false,
        company: data.fieldLearningQuoteWork || false,
      };
      if (slogan.title) {
        slogan.title = `<q>${slogan.title}</q>`;
      }
    } else {
      slogan = data.fieldFrontpageQuote;
    }
    return slogan;
  }

  public getStudy(data: any, theme: string): IStudy {
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
        data: data.fieldLearningToTeach.map((obj: any, i: number) => {
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

  public getNews(data: any, theme: string): Observable<ISimpleArticle> | null {
    const source = data.fieldTeachingNews ||
      data.fieldLearningNews ||
      data.fieldFrontpageNews;

    if (!source) {
      return null;
    }

    return this.getSingleNews(source.entity.entityUrl.path);
  }

  public parseEvents(items: any[]): IEvent[] {
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
      };
    });
  }

  public getEvents(): Observable<IEvent[]> {
    const sub: Subject<IEvent[]> = new Subject<IEvent[]>();
    const variables = {
      lang: 'ET',
    };

    const one = this.settings.query('teachingPageEvents', variables);
    const two = this.settings.query('teachingPageAdditionalEvents', variables);
    this.http.get(one).subscribe((response: any) => {
      if (response.data.nodeQuery.entities.length < this.eventCount) {
        this.http.get(two).subscribe((additional: any) => {
          sub.next([
            ...this.parseEvents(response.data.nodeQuery.entities),
            ...this.parseEvents(additional.data.nodeQuery.entities),
          ].slice(0, this.eventCount));
        });
      } else {
        sub.next(this.parseEvents(response.data.nodeQuery.entities));
      }
    });

    return sub;
  }
}
