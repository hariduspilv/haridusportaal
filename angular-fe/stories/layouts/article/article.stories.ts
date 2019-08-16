import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import { TranslateService } from '@app/_modules/translate/translate.service';
import articleStoriesTemplateHtml from './article.stories.template.html';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@app/_modules/translate/translate.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const moduleMetadata = {
  imports: [
    AssetsModule,
    RouterTestingModule,
    TranslateModule.forRoot(),
    BrowserAnimationsModule,
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

const stories = storiesOf('Layouts', module);
stories.add('Article Layout', () => {
  return {
    moduleMetadata,
    props: {
      breadcrumbsData,
      videoData,
    },
    template: articleStoriesTemplateHtml,
  };
});
