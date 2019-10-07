import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import studyProgrammesMd from './studyProgrammes.md';
import studyProgrammesHtml from './studyProgrammes.html';
import { TranslateModule } from '@app/_modules/translate';
import { list } from './studyProgrammes.data';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
const moduleMetadata = {
  imports: [
    AssetsModule,
    RouterTestingModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot(),
  ],
};

const stories = storiesOf('Assets', module);

stories.add('Study Programmes', () => {

  return {
    moduleMetadata,
    props: {
      list,
    },
    template: studyProgrammesHtml,
  };
},          {
  notes: { markdown: studyProgrammesMd },
});
