import { storiesOf } from '@storybook/angular';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@app/_modules/translate/translate.module';
import { DetailViewModule } from '@app/_views/detailView';
import { SettingsService } from '@app/_services';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { withKnobs } from '@storybook/addon-knobs';
import detailViewHtml from './detailView.html';
import detailViewMd from './detailView.md';
import { AssetsModule } from '@app/_assets';

const moduleMetadata = {
  imports: [
    RouterTestingModule,
    TranslateModule.forRoot(),
    DetailViewModule,
    BrowserAnimationsModule,
    AssetsModule,
  ],
  providers: [
    TranslateService,
    SettingsService,
  ],
};

const notes = { markdown: detailViewMd };

const storyData = (type) => {
  const data = {
    news: {
      type: 'news',
      path: '/uudised/haridus-ja-teadusminister-mailis-repsi-kooliaasta-alguse-tervitus',
    },
  };

  return {
    moduleMetadata,
    props: {
      data: data[type],
    },
    template: detailViewHtml,
  };
};

const stories = storiesOf('Views', module);

stories.add('News', () => { return storyData('news'); }, { notes });
stories.add('School', () => { return storyData('school'); }, { notes });
stories.add('studyProgramme', () => { return storyData('studyProgramme'); }, { notes });