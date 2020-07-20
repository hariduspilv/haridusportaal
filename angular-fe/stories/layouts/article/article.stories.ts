import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { TranslateService } from '@app/_modules/translate/translate.service';
import articleStoriesTemplateHtml from './article.stories.template.html';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@app/_modules/translate/translate.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LOCALE_ID } from '@angular/core';
// tslint:disable-next-line: import-name
import localeEt from '@angular/common/locales/et';
import { registerLocaleData } from '@angular/common';
localeEt[14][0].replace(',', ' ');
localeEt[14][1].replace(',', ' ');
localeEt[14][2].replace(',', ' ');
registerLocaleData(localeEt);
import {
  withKnobs,
  object,
} from '@storybook/addon-knobs';
import { ModalService, RippleService } from '@app/_services';
import { EmbedVideoService } from 'ngx-embed-video';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { ActivatedRoute } from '@angular/router';

const moduleMetadata = {
  imports: [
    AssetsModule.forRoot(),
    RouterTestingModule,
    TranslateModule.forRoot(),
    BrowserAnimationsModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue:'et' },
  ],
};

const videoData = [
  {
    input: 'https://www.youtube.com/watch?v=atY7ymXAcRQ',
    videoDomain: 'youtube.com',
    videoDescription: 'Sunshine lollipops and rainbows!',
    videoId: 'atY7ymXAcRQ',
  },
];

const charts = [
  {
    graphSet: null,
    graphTitle: 'Kassi ja koera kaalumised',
    // tslint:disable-next-line: max-line-length
    filterValues: '{"graph_type":"line","graph_options":{"graph_title":"Kassi ja koera kaalumised","graph_indicator":{"Kaal":"Kaal"},"graph_v_axis":"periood","graph_group_by":{"valdkond":"valdkond"},"graph_filters":{"valdkond":{"koer":"koer","kass":"kass"},"alavaldkond":[],"ametiala":[],"periood":[],"silt":[]},"graph_y_min":"0","graph_y_unit":"summa","graph_text":{"value":"\\u003Cp\\u003EM\\u00f5nel aastal ununes kaaluda.\\u003C\\/p\\u003E\\r\\n","format":"custom_editor"}},"_weight":"0","_original_delta":0,"hierarchy":null}',
    graphType: 'line',
    secondaryGraphType: null,
    graphText: '<p>Mõnel aastal ununes kaaluda.</p>\r\n',
  },
  {
    graphSet: null,
    graphTitle: 'testime asukohta',
    // tslint:disable-next-line: max-line-length
    filterValues: '{"graph_type":"stacked bar","graph_options":{"graph_title":"testime asukohta","indicator_count":"1","indicators":[{"indicator_set":{"graph_indicator":"Kukkel","secondary_graph_indicator":[]}}],"graph_v_axis":"periood","graph_group_by":{"valdkond":"valdkond"},"graph_filters":{"valdkond":{"raport":"raport","raamat":"raamat","veksel":"veksel","vihik":"vihik"},"alavaldkond":[],"ametiala":[],"periood":[],"silt":[]},"graph_y_min":"0","secondary_graph_y_min":"0","secondary_graph_type":"","graph_y_unit":"summa","graph_text":{"value":"","format":"custom_editor"}},"_weight":"1","_original_delta":1,"hierarchy":null}',
    graphType: 'stacked bar',
    secondaryGraphType: '',
    graphText: '',
  },
  {
    graphSet: null,
    graphTitle: 'teeeest',
    // tslint:disable-next-line: max-line-length
    filterValues: '{"graph_type":"stacked column","graph_options":{"graph_title":"teeeest","indicator_count":"1","indicators":[{"indicator_set":{"graph_indicator":"Kaal","secondary_graph_indicator":{"Kaal2":"Kaal2"}}}],"graph_v_axis":"periood","graph_group_by":{"valdkond":"valdkond","naitaja":"naitaja"},"graph_filters":{"valdkond":[],"alavaldkond":[],"ametiala":[],"periood":[],"silt":[]},"graph_y_min":"0","secondary_graph_y_min":"0","secondary_graph_type":"line","graph_y_unit":"summa","graph_text":{"value":"","format":"custom_editor"}},"_weight":"5","_original_delta":5,"hierarchy":null}',
    graphType: 'stacked column',
    secondaryGraphType: 'line',
    graphText: '',
  },
  {
    graphSet: null,
    graphTitle: 'Combo 3',
    // tslint:disable-next-line: max-line-length
    filterValues: '{"graph_type":"stacked column","graph_options":{"graph_title":"Combo 3","indicator_count":"3","indicators":[{"indicator_set":{"graph_indicator":"Palk","secondary_graph_indicator":{"Investeeringud":"Investeeringud"}}},{"indicator_set":{"graph_indicator":"H\\u00f5ivatute arv","secondary_graph_indicator":{"Lisandv\\u00e4\\u00e4rtus":"Lisandv\\u00e4\\u00e4rtus"}}},{"indicator_set":{"graph_indicator":"Eksport (%)","secondary_graph_indicator":{"Ekspordi keskmine (%)":"Ekspordi keskmine (%)"}}}],"graph_v_axis":"periood","graph_group_by":{"naitaja":"naitaja"},"graph_filters":{"valdkond":[],"alavaldkond":{"metallit\\u00f6\\u00f6stus":"metallit\\u00f6\\u00f6stus"},"ametiala":[],"periood":[],"silt":[]},"graph_y_min":"0","secondary_graph_y_min":"0","secondary_graph_type":"line","graph_y_unit":"summa","graph_text":{"value":"","format":"custom_editor"}},"_weight":"6","_original_delta":6,"hierarchy":null}',
    graphType: 'stacked column',
    secondaryGraphType: 'line',
    graphText: '',
  },
];

const breadcrumbsData = [
  {
    title: 'Avaleht',
    link: '/',
  },
  {
    title: 'Nimistu',
    link: 'haha henri sakib',
  },
  {
    title: 'Detail',
  },
];

const stories = storiesOf('Layouts', module);
stories.addDecorator(withKnobs);
stories.add('Article Layout', () => {
  const sidebarData = {
    entity: {
      fieldPros: [
        'Pluss 1',
      ],
      nodeQuery: {
        entities: [
          {
            entityLabel: 'Juuli uudis',
            created: 1563799160,
            fieldAuthor: 'TWN',
            fieldIntroductionImage: {
              derivative: {
                // tslint:disable-next-line: max-line-length
                url: 'http://htm.wiseman.ee/sites/default/files/styles/crop_small/public/2019-07/koer-retriiver-bokeh-lumi-talv-kapuuts.jpg?h=1d4b4ebd&itok=5NHInAKT',
              },
              title: 'koer',
              alt: 'Alt tekst',
            },
            fieldShortDescription: 'Juulikuus lumi on maas.',
            entityUrl: {
              path: '/uudised/juuli-uudis',
              languageSwitchLinks: [
                {
                  url: {
                    path: '/uudised/juuli-uudis',
                  },
                },
                {
                  url: {
                    path: '/node/54930',
                  },
                },
              ],
            },
          },
          {
            entityLabel: 'Test uudis',
            created: 1555843135,
            fieldAuthor: 'Kalle Kaarel',
            fieldIntroductionImage: {
              derivative: {
                // tslint:disable-next-line: max-line-length
                url: 'http://htm.wiseman.ee/sites/default/files/styles/crop_small/public/2019-04/koer-retriiver-bokeh-lumi-talv-kapuuts.jpg?itok=lo83jJLa',
              },
              title: 'Super uudis',
              alt: 'Alt tekst',
            },
            fieldShortDescription: 'Jutt ilus jutt. 1001',
            entityUrl: {
              path: '/uudised/test-uudis',
              languageSwitchLinks: [
                {
                  url: {
                    path: '/uudised/test-uudis',
                  },
                },
                {
                  url: {
                    path: '/node/52250',
                  },
                },
              ],
            },
          },
          {
            entityLabel: 'rzdm automaat',
            created: 1555369449,
            fieldAuthor: 'Kiisu Madis',
            fieldIntroductionImage: {
              derivative: {
                // tslint:disable-next-line: max-line-length
                url: 'http://htm.wiseman.ee/sites/default/files/styles/crop_small/public/2019-04/3_619.jpg?itok=D4MW0uOe',
              },
              title: 'Pealkiri',
              alt: 'Alt tekst',
            },
            // tslint:disable-next-line: max-line-length
            fieldShortDescription: 'Eile ja täna kogunevad Tallinnas OECD liikmesriikide eksperdid, kes arutavad, kuidas mõõta teaduse ja tehnoloogia mõju ühiskonnale ja majandusele. Riikide kogemuste kõrvutamine näitab, et teaduse ja tehnoloogia mõjude hindamise teeb keeruliseks see, et need ilmnevad alles pika aja pärast. 1001 Eile ja täna kogunevad Tallinnas OECD liikmesriikide eksperdid, kes arutavad, kuidas mõõta teaduse ja tehnoloogia mõju ühiskonnale ja majandusele. Riikide kogemuste kõrvutamine näitab, et teaduse ja tehno.',
            entityUrl: {
              path: '/uudised/rzdmautomaattest',
              languageSwitchLinks: [
                {
                  url: {
                    path: '/uudised/rzdmautomaattest',
                  },
                },
                {
                  url: {
                    path: '/node/52096',
                  },
                },
              ],
            },
          },
        ],
      },
      fieldNeutral: [
        'Neurtaalne 1',
      ],
      fieldCons: [
        'Miinus 1',
        // tslint:disable-next-line: max-line-length
        'Keemik-õhkaja Keemik-õhkaja Keemik-õhkaja Keemik-õhkaja Keemik-õhkaja Majandusministeeriumis ekspeks',
      ],
      fieldQualificationStandard: [
        {
          url: {
            routed: false,
            path: 'eesti.ee',
          },
          title: 'Outbound lingi tekst',
        },
        {
          url: {
            routed: true,
            path: '/artiklid/haridusministeerium-loobus-rkas-i-teenusest',
          },
          title: 'Kutsestandardi lingi tekst',
        },
        {
          url: {
            routed: true,
            path: '/artiklid/haridusministeerium-loobus-rkas-i-teenusest',
          },
          // tslint:disable-next-line: max-line-length
          title: 'Kutsestandardi teine lingi tekst testime pikkust tekst tekts teksk kaf ksam fsa pf msao fpa s nsfa tekst',
        },
      ],
      fieldQuickFind: [
        {
          url: {
            routed: true,
            path: '/artiklid/dignissim-luctus-ullamcorper',
          },
          title: 'Leia kiiresti lingi tekst',
        },
      ],
      fieldContact: {
        entity: {
          fieldEmail: 'kala@kila.fi',
          fieldOrganization: 'Organi OÜ',
          fieldPerson: 'Malle Raha',
          fieldPhone: '+372 55 666666',
        },
      },
      fieldAdditional: {
        entity: {
          fieldTitle: 'Siia saab ise kirjutada pealkirja',
          // tslint:disable-next-line: max-line-length
          fieldAdditionalBody: 'Mingi väga tähtis jutt mahub siia äea küll ju. Mingi väga tähtis jutt mahub siia äea küll ju. Mingi väga tähtis jutt mahub siia äea küll ju. Mingi väga tähtis jutt mahub siia äea küll juuuuuuuuuuuuu.',
        },
      },
      fieldButton: [
        {
          url: {
            routed: false,
            path: 'http://www.google.com',
          },
          title: 'EHIS avalik vaade',
        },
        {
          url: {
            routed: false,
            path: 'http://www.priit.party',
          },
          title: 'Sisene EHIS-sse',
        },
      ],
      fieldSchoolLocation: [
        {
          entity: {
            fieldAddress: 'Tartu mnt 23, Kesklinna linnaosa, Tallinn, Harju maakond',
            fieldLocationType: 'L',
            fieldSchoolLocation: [
              {
                entity: {
                  name: 'Kesklinna linnaosa',
                },
              },
            ],
            fieldCoordinates: {
              lat: '59.433569345107',
              lon: '24.762786765357',
              zoom: null,
            },
          },
        },
      ],
      // Second map
      fieldEventLocation: {
        name: 'Raekoja plats 1',
        lat: '59.437182',
        lon: '24.7450143',
        zoom: '9',
      },
      reverseOskaMainProfessionOskaFillingBarEntity: {
        entities: [
          {
            value: 4,
          },
        ],
      },
      reverseOskaMainProfessionOskaIndicatorEntity: {
        entities: [
          {
            oskaId: 1,
            oskaIndicator: 'Hõivatute arv',
            value: '450',
            icon: 4,
          },
          {
            oskaId: 2,
            oskaIndicator: 'Hõive muutus',
            value: '1',
            icon: 5,
          },
          {
            oskaId: 3,
            oskaIndicator: 'Brutopalk',
            value: '7500',
            icon: 1,
          },
          {
            oskaId: 4,
            oskaIndicator: 'Töökohtade ja lõpetajate arvu võrdlus',
            value: '1',
            icon: 1,
          },
        ],
      },
      fieldRegistration: {
        nid: 50563,
        entityLabel: 'Testsündmus regamisega',
        RegistrationCount: 0,
        fieldMaxNumberOfParticipants: null,
        fieldEntryType: 'register',
        fieldEventMainDate: {
          value: '2020-03-31',
          date: '2020-03-31 12:00:00 UTC',
          unix: '1585656000',
        },
        fieldEventMainStartTime: null,
        fieldEventMainEndTime: null,
        fieldEventDate: [], // Extra dates
        fieldRegistrationDate: {
          entity: {
            fieldRegistrationFirstDate: {
              value: '2019-01-01',
              date: '2019-01-01 12:00:00 UTC',
              unix: '1546344000',
            },
            fieldRegistrationLastDate: {
              value: '2020-04-30',
              date: '2020-04-30 12:00:00 UTC',
              unix: '1588248000',
            },
          },
        },
      },
      fieldRegistration2: {
        entityLabel: 'Meeskonnatöö, tööalased suhted, töökultuur',
        nid: 10295,
        RegistrationCount: 0,
        fieldMaxNumberOfParticipants: 120,
        fieldEventMainDate: {
          value: '2018-08-01',
          date: '2018-08-01 12:00:00 UTC',
          unix: '1533124800',
        },
        fieldEventMainEndDate: null,
        fieldEventMainStartTime: 3600,
        fieldEventMainEndTime: 84780,
        EventRegistrations: null,
        fieldOrganizer: 'Firma nimi',
        fieldEventDate: [
          {
            entity: {
              fieldEventDate: null,
              fieldEventStartTime: 39600,
              fieldEventEndTime: 61200,
            },
          },
          {
            entity: {
              fieldEventDate: null,
              fieldEventStartTime: 39600,
              fieldEventEndTime: 54000,
            },
          },
          {
            entity: {
              fieldEventDate: null,
              fieldEventStartTime: 36000,
              fieldEventEndTime: 39600,
            },
          },
        ],
        fieldEntryType: 'invite',
        fieldRegistrationDate: null,
        fieldEventLink: [
          {
            url: {
              routed: false,
              path: 'http://htm.twn.ee/et/sundmused/meeskonnatoo-tooalased-suhted-tookultuur',
            },
            title: 'lingi tekst',
          },
        ],
        fieldDescription: {
          // tslint:disable-next-line: max-line-length
          value: '<p>Lorem ipsum dolor sit amet, lorem ipsum dolor sit amet, lorem ipsum dolor sit amet, lorem ipsum dolor sit amet, lorem ipsum dolor sit amet, lorem ipsum dolor sit amet, lorem ipsum dolor sit amet.</p>\r\n',
        },
        fieldDescriptionSummary: 'See on sissejuhatus',
        fieldContactPerson: 'Madis Kana',
        fieldContactPhone: '9995959595',
        fieldContactEmail: 'tanel.tromp@twn.ee',
        fieldPracticalInformation: {
          // tslint:disable-next-line: max-line-length
          value: '<p>See on praktiline informatsioon.&nbsp; See on praktiline informatsioon. See on praktiline informatsioon. See on praktiline informatsioon. See on praktiline informatsioon. See on praktiline informatsioon. See on praktiline informatsioon.</p>\r\n',
          format: 'custom_editor',
          // tslint:disable-next-line: max-line-length
          processed: '<p>See on praktiline informatsioon.  See on praktiline informatsioon. See on praktiline informatsioon. See on praktiline informatsioon. See on praktiline informatsioon. See on praktiline informatsioon. See on praktiline informatsioon.</p>',
        },
        fieldEventGroup: {
          targetId: 1369,
        },
        fieldTag: [
          {
            entity: null,
          },
        ],
        fieldEventType: {
          entity: {
            entityLabel: 'Konverents',
          },
        },
        fieldRegistrationUrl: null,
      },
    },
  };
  const feedbackNid = '48788';
  const sidebar = object('Sidebar', sidebarData);
  return {
    moduleMetadata,
    props: {
      charts,
      breadcrumbsData,
      videoData,
      sidebar,
      feedbackNid,
    },
    template: articleStoriesTemplateHtml,
    styleUrls: ['./article.stories.styles.scss'],
  };
});
