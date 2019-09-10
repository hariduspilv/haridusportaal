import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import newsMd from './news.md';
import newsHtml from './news.html';
import { TranslateModule } from '@app/_modules/translate';
import { list } from './news.data';
const moduleMetadata = {
  imports: [
    AssetsModule,
    TranslateModule.forRoot(),
  ],
};

const stories = storiesOf('Assets', module);

stories.add('News', () => {

  return {
    moduleMetadata,
    props: {
      list,
    },
    template: newsHtml,
  };
},          {
  notes: { markdown: newsMd },
});
