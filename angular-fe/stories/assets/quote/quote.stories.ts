import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import quoteMd from './quote.md';
import quoteHtml from './quote.html';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
};

const stories = storiesOf('Assets', module);
stories.add('BlockQuote', () => {

  return {
    moduleMetadata,
    template: quoteHtml,
  };
},          {
  notes: { markdown: quoteMd },
});
