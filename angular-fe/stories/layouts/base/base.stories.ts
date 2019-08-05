import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { TranslateService } from '@app/_modules/translate/translate.service';
import baseStoriesTemplateHtml from './base.stories.template.html';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@app/_modules/translate/translate.module';
import { Alert, AlertType } from '@app/_services';

const moduleMetadata = {
  imports: [
    AssetsModule,
    RouterTestingModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot(),

  ],
  providers: [
    TranslateService,
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

const alertsData = [
  new Alert({
    message: `
    ♪♫Kui Erkki mind ei armasta, siis lõpp on lool♫♪
    `,
    type: AlertType.Warning,
  }),
];
const plokk1Alerts = [
  new Alert({ message: 'Error tekst', id:'plokk1', type: AlertType.Error }),
];
const plokk2Alerts = [
  new Alert({ message: 'Error tekst', id:'plokk2', type: AlertType.Info }),
];
const plokk3Alerts = [
  new Alert({ message: 'Error tekst', id:'plokk3', type: AlertType.Success }),
];

const stories = storiesOf('Layouts', module);
stories.add('Baselayout', () => {
  return {
    moduleMetadata,
    props: {
      breadcrumbsData,
      videoData,
      alertsData,
      plokk2Alerts,
      plokk3Alerts,
      plokk1Alerts,
    },
    template: baseStoriesTemplateHtml,
  };
});
