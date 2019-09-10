import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import infoSystemMd from './infoSystem.md';
import infoSystemHtml from './infoSystem.html';
import { TranslateModule } from '@app/_modules/translate';
import { data } from './infoSystem.data';
const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
};

const stories = storiesOf('Assets', module);

stories.add('List item', () => {

  return {
    moduleMetadata,
    props: {
      data,
    },
    template: infoSystemHtml,
  };
},          {
  notes: { markdown: infoSystemMd },
});
