import { storiesOf } from '@storybook/angular';
import { AssetsModule } from '@app/_assets';
import instructionsMd from './instructions.md';
import documentationMd from './documentation.md';
import blockQuoteHtml from './regular/blockQuote.html';

const moduleMetadata = {
  imports: [
    AssetsModule,
  ],
};

const stories = storiesOf('Assets/BlockQuote', module);

stories.add('Regular', () => {

  return {
    moduleMetadata,
    template: blockQuoteHtml,
  };
},          {
  notes: { Instructions: instructionsMd, Documentation: documentationMd },
});
