import {
  Component,
  OnInit,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '@app/_services';
import { TranslateService } from '@app/_modules/translate/translate.service';
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
  public newsLink: string = '';
  public theme: string = 'default';
  public events: any[] = [];
  public study: any = {};
  public careerDevelopment: string;

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
    private route: ActivatedRoute,
    private translate: TranslateService,
  ) {
  }

  ngOnInit() {
    this.route.data.subscribe((response) => {
      this.theme = response.theme || this.theme;
      this.getData();
    });
  }

  private getData(): void {
    const variables = {
      lang: 'ET',
    };

    let query = 'newFrontPageQuery';
    if (this.theme === 'teachers') {
      query = 'teachingPage';
    } else if (this.theme === 'career') {
      query = 'careerPage';
    } else if (this.theme === 'learning') {
      query = 'learningHomePage';
    }

    const path = this.settings.query(query, variables);
    const topicsSubscription = this.http.get(path).subscribe((response) => {
      this.parseData(response['data']['nodeQuery']['entities'][0]);
      topicsSubscription.unsubscribe();
    });
  }

  private parseData(data: any): void {
    try {
      if (this.theme === 'career') {
        this.careerDevelopment = data.fieldCareer.entity.entityUrl.path;
      }
    } catch (err) {
    }

    try {
      const topics = data.fieldFrontpageTopics ||
        data.fieldTeachingThemes ||
        data.fieldContentPageLink;

      if (this.theme === 'career') {
        const item = topics;
        this.articles = [{
          title: item.entity.fieldTitle,
          content: item.entity.fieldText,
          link: {
            title: this.translate.get('home.view_more'),
            url: {
              routed: item.entity.fieldInternalLink.entity.entityUrl.routed,
              path: item.entity.fieldInternalLink.entity.entityUrl.path,
            },
          },
          image: '/assets/img/homepage-articles-career-1.svg',
        }];

        this.topics = [
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
        ];
      } else if (this.theme === 'learning') {
        const item = data.fieldLearningContentLinks;
        this.articles = item.map((article: any) => {
          return {
            title: article.entity.fieldTitle,
            content: article.entity.fieldText,
            link: {
              title: this.translate.get('home.view_more'),
              url: article.entity.fieldInternalLink.entity.entityUrl,
            },
          };
        });

        this.topics = [
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
        ];
      } else {
        this.topics = topics.map((item: any) => {
          let image: any = false;
          let link: any;
          let scrollTo: boolean | string = false;

          if (this.theme === 'default') {
            image = '';
            link = item.entity.fieldTopicLink;
            if (link.url.path.match('scrollTo:')) {
              scrollTo = link.url.path.split('scrollTo:')[1];
            }
          } else if (this.theme === 'teachers') {
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
    } catch (err) {
    }

    try {
      if (this.theme === 'teachers' || this.theme === 'career' || this.theme === 'learning') {
        const contact = data.fieldContact || data.fieldCareerContact || data.fieldLearningContact;
        this.contact.contacts = contact.map((item: any) => {
          return {
            company: item.entity.fieldInstitution || false,
            name: item.entity.fieldNameOccupation || false,
            email: item.entity.fieldEmail || false,
            skype: item.entity.fieldSkype || false,
          };
        });

        if (this.theme === 'teachers') {
          this.contact.logos = [
            {
              src: '/assets/img/homepage-teachers.svg',
              label: 'Logo - Õpetajad loovad homse eesti',
            },
          ];
        } else if (this.theme === 'career') {
          this.contact.logos = [
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
          ];
        } else if (this.theme === 'learning') {
          this.contact.logos = [
            {
              src: '/assets/img/homepage-footer-learning-1.svg',
              label: 'Logo - Innove',
            },
          ];
        }

        const links = data.fieldExternal ||
          data.fieldExternalLinks ||
          data.fieldLearningExternalLinks;
        this.contact.links = links.map((item: any) => {
          return {
            url: {
              title: item.entity.fieldLinkName,
              path: item.entity.fieldWebpageLink.url.path,
              routed: false,
            },
          };
        });
      } else {
        this.contact = {
          email: data.fieldFrontpageContactEmail,
          name: data.fieldFrontpageContactName,
          phone: data.fieldFrontpageContactPhone,
        };
      }
    } catch (err) {
    }

    try {
      if (this.theme === 'teachers' || this.theme === 'career') {
        this.slogan = {
          title: data.fieldQuoteText || false,
          person: data.fieldQuoteAuthor || false,
          company: data.fieldQuoteAuthorOccupation || false,
        };
      } else if (this.theme === 'learning') {
        this.slogan = {
          title: data.fieldLearningQuoteText || false,
          person: data.fieldLearningQuoteAuthor || false,
          company: data.fieldLearningQuoteWork || false,
        };
        if (this.slogan.title) {
          this.slogan.title = `<q>${this.slogan.title}</q>`;
        }
      } else {
        this.slogan = data.fieldFrontpageQuote;
      }
    } catch (err) {
    }

    try {
      if (this.theme === 'default') {
        this.services = data.fieldFrontpageServices.map((item: any) => {
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
      } else if (this.theme === 'learning') {
        this.services = data.fieldLearningPath.map((item: any) => {
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
      } else {
        this.services = data.fieldToolbox.map((item: any) => {
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
    } catch (err) {
    }

    try {
      if (this.theme === 'teachers') {
        this.newsLink = data.fieldTeachingNews.entity.entityUrl.path;
      } else if (this.theme === 'learning') {
        this.newsLink = data.fieldLearningNews.entity.entityUrl.path;
      } else {
        this.newsLink = data.fieldFrontpageNews.entity.entityUrl.path;
      }
    } catch (err) {
    }

    if (!this.articles && this.topics) {
      this.articles = this.topics;
    }

    if (this.articles) {
      this.articles = this.articles.map((item, index) => {
        let position = index % 2 ? 'left' : 'right';

        if (this.theme === 'career') {
          position = index % 2 ? 'right' : 'left';
        }
        return {
          position,
          ...item,
        };
      }).filter((item) => {
        return item.title !== '-';
      });
    }

    if (this.topics) {
      this.topics = this.topics.map((item, index) => {
        let position = index % 2 ? 'left' : 'right';
        if (this.theme === 'career') {
          position = index % 2 ? 'right' : 'left';
        }
        return {
          position,
          ...item,
        };
      });
    }

    try {
      if (this.theme === 'default') {
        this.study = {
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
      } else if (this.theme === 'learning') {
        this.study = {
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
    } catch (err) {
    }
  }
}
