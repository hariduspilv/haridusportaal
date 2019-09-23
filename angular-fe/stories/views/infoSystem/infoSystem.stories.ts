import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import infoSystemMd from './infoSystem.md';
import infoSystemHtml from './infoSystem.html';
import { TranslateModule } from '@app/_modules/translate';
import { data, breadcrumbsData } from './infoSystem.data';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
    BrowserAnimationsModule,
    RouterTestingModule,
  ],
};

const stories = storiesOf('Views', module);

stories.add('Infosystem', () => {

  return {
    moduleMetadata,
    props: {
      breadcrumbsData,
      data,
    },
    template: infoSystemHtml,
  };
},          {
  notes: { markdown: infoSystemMd },
});
